// Engineering's reviewed full-matrix policy. Pure; no provider I/O or publication.
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import anchors from './full-matrix-anchors.json' with { type: 'json' };

export const FULL_SCHEMA = 'kaal.full-matrix/v1';
const canonical = value => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return Array.from(value, canonical);
  if (value && Object.getPrototypeOf(value) === Object.prototype)
    return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  throw new TypeError('digest inputs must be complete JSON values');
};
export const digest = value => sha256(new TextEncoder().encode(JSON.stringify(canonical(value))));
const handles = new WeakMap();
const sha = s => typeof s === 'string' && /^[a-f0-9]{40}$/.test(s);
const integer = n => Number.isSafeInteger(n) && n > 0;
const freeze = x => {
  if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); }
  return x;
};

const jobs = (id, name, os = 'Linux') => ({ job: id, check: name, os,
  labels: [({ Linux: 'ubuntu-latest', Windows: 'windows-latest', macOS: 'macos-latest' })[os]] });
const hosts = ['Linux', 'Windows', 'macOS'];
const definitions = [
  { file: 'ci.yml', id: 383088175, kind: 'code', jobs: [
    ...hosts.map(os => jobs('hosting', `Hosting (${os})`, os)),
    ...hosts.map(os => jobs(os === 'Linux' ? 'lane' : 'acceptance', os === 'Linux' ? 'Acceptance' : `Acceptance (${os})`, os)),
    jobs('lane', 'Workspaces'), jobs('lane', 'Engineering'),
    ...hosts.map(os => jobs(os === 'Linux' ? 'guard' : 'guard-hosts', os === 'Linux' ? 'Guard' : `Guard (${os})`, os)),
  ] },
  { file: 'change-isolation.yml', id: 384218565, kind: 'policy', jobs: [jobs('change-isolation', 'Change Isolation')] },
  { file: 'lineage-synchronization.yml', id: 384461082, kind: 'policy', jobs: [jobs('lineage-synchronization', 'Branching')] },
  { file: 'promotion-source.yml', id: 384297776, kind: 'policy', jobs: [jobs('promotion-source', 'Promotion Source')] },
  { file: 'codeql.yml', id: 386954811, kind: 'code', jobs: [jobs('analyze', 'CodeQL (actions)'), jobs('analyze', 'CodeQL (javascript-typescript)')] },
  { file: 'dependency-review.yml', id: 387016191, kind: 'pr', jobs: [jobs('dependency-review', 'Dependency Review')] },
  { file: 'guard-acceptance-boundary.yml', id: 393958429, kind: 'guard', jobs: [jobs('acceptance-boundary', 'Guard Acceptance Boundary')] },
  { file: 'branching-audit.yml', id: 389075849, kind: 'push', jobs: [jobs('audit', 'Branching audit')] },
];

export function gateFor(context) {
  if (context?.baseRef === 'main' && ['pull_request', 'push'].includes(context.event)) return 'KAAL Main';
  if (context?.event === 'pull_request' && /^kaal\/[^/]+$/.test(context.baseRef ?? '')) return 'KAAL Lineage';
  return null;
}

/** Declarative policy view; it establishes no evidence authority by itself. */
export function fullWorkflows(context) {
  if (!gateFor(context)) throw new TypeError('unsupported full-matrix event/target');
  return freeze(definitions.filter(w => w.kind === 'code' ||
    (context.event === 'pull_request' && ['policy', 'pr'].includes(w.kind)) ||
    (context.event === 'pull_request' && context.baseRef === 'kaal/guard' && w.kind === 'guard') ||
    (context.event === 'push' && w.kind === 'push')).map(w => ({ ...w,
      path: `.github/workflows/${w.file}`, event: w.kind === 'policy' ? 'pull_request_target' : context.event,
      sourceDigest: anchors.sources[`.github/workflows/${w.file}`], appId: anchors.appId,
  })));
}

/** Context and source bytes must be read independently from trusted Git/provider data.
 * Matching digests establish policy consistency, not authenticity of a caller's transport.
 * The opaque result prevents a candidate-supplied expected inventory being substituted.
 */
export function establishFullMatrix(context, snapshot) {
  if (!gateFor(context) || context.repository !== anchors.repository || context.repositoryId !== anchors.repositoryId ||
      !['headSha', 'baseSha', 'testedSha', 'testedTreeSha', 'governanceSha'].every(k => sha(context[k])) ||
      !integer(context.generation) || !Number.isSafeInteger(context.startedAt) || !Number.isSafeInteger(context.deadline) ||
      context.startedAt < 0 || context.deadline <= context.startedAt ||
      (context.event === 'pull_request' ? !integer(context.pr) || context.testedSha === context.headSha ||
        !Array.isArray(context.parents) || JSON.stringify(context.parents) !== JSON.stringify([context.baseSha, context.headSha])
        : context.pr !== null || context.testedSha !== context.headSha) ||
      context.publicationSha !== context.testedSha || snapshot?.revision !== context.baseSha) {
    throw new TypeError('independent current repository/event/revision context unavailable');
  }
  const sources = snapshot?.sources;
  if (!sources || JSON.stringify(Object.keys(sources).sort()) !== JSON.stringify(Object.keys(anchors.sources).sort()))
    throw new TypeError('complete governed workflow and Guard declaration inventory unavailable');
  for (const [path, expected] of Object.entries(anchors.sources)) {
    if (typeof sources[path] !== 'string' || sha256(new TextEncoder().encode(sources[path])) !== expected)
      throw new TypeError(`unapproved workflow/command policy drift: ${path}`);
  }
  const workflows = fullWorkflows(context);
  if (!context.producers ||
      JSON.stringify(Object.keys(context.producers).sort()) !== JSON.stringify(workflows.map(w => w.path).sort()) ||
      Object.values(context.producers).some(p => p !== null && (!integer(p?.runId) || !integer(p?.attempt))))
    throw new TypeError('complete independently pinned producer generations required');
  const inventory = workflows.flatMap(w => w.jobs.map(({ check, os }) => ({ check, os })));
  const ctx = structuredClone(context);
  const policyDigest = digest(anchors);
  const matrixDigest = digest(workflows);
  const contextDigest = digest(ctx);
  const expected = freeze({ schema: FULL_SCHEMA, authoritative: true, resolved: true,
    event: ctx.event, baseRef: ctx.baseRef, headSha: ctx.headSha, baseSha: ctx.baseSha,
    policyDigest, matrixDigest, contextDigest, inventory, required: inventory, nonImpact: [],
    workflows, context: ctx, gate: gateFor(ctx) });
  const handle = Object.freeze({ gate: expected.gate, policyDigest, matrixDigest, contextDigest });
  handles.set(handle, expected);
  return handle;
}

export function fullExpected(authority) {
  const expected = authority && typeof authority === 'object' && handles.get(authority);
  if (!expected) throw new TypeError('independently established full-matrix authority required');
  return expected;
}

export function fullManifest(authority) {
  const e = fullExpected(authority);
  return { schema: FULL_SCHEMA, mode: 'full-assurance', resolved: true, event: e.event,
    baseRef: e.baseRef, headSha: e.headSha, baseSha: e.baseSha, policyDigest: e.policyDigest,
    matrixDigest: e.matrixDigest, contextDigest: e.contextDigest,
    selected: structuredClone(e.inventory), excluded: [] };
}
