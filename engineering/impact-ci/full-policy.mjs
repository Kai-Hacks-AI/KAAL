// Engineering's reviewed full-matrix policy. Pure; no provider I/O or publication.
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import anchors from './full-matrix-anchors.json' with { type: 'json' };
import { digest } from './policy-identity.mjs';
import { workflowDefinitions } from './workflow-definitions.mjs';
import { selectAssurancePolicy, resolveAssurancePolicy } from './assurance-policy.mjs';
import mainPolicy from './policies/main.json' with { type: 'json' };
import lineagePolicy from './policies/lineage.json' with { type: 'json' };

export { digest };
export const FULL_SCHEMA = 'kaal.full-matrix/v1';
const handles = new WeakMap();
const sha = s => typeof s === 'string' && /^[a-f0-9]{40}$/.test(s);
const integer = n => Number.isSafeInteger(n) && n > 0;
const freeze = x => {
  if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); }
  return x;
};

const policies = freeze([mainPolicy, lineagePolicy]);
export function gateFor(context) {
  return selectAssurancePolicy(context, policies)?.policy.gate ?? null;
}

/** Declarative view from the selected independent policy, not the other gate. */
export function fullWorkflows(context) {
  return freeze(resolveAssurancePolicy(context, policies, workflowDefinitions).workflows);
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
  const selectedPolicy = resolveAssurancePolicy(context, policies, workflowDefinitions);
  const workflows = selectedPolicy.workflows;
  if (!context.producers ||
      JSON.stringify(Object.keys(context.producers).sort()) !== JSON.stringify(workflows.map(w => w.path).sort()) ||
      Object.values(context.producers).some(p => p !== null && (!integer(p?.runId) || !integer(p?.attempt))))
    throw new TypeError('complete independently pinned producer generations required');
  const inventory = workflows.flatMap(w => w.jobs.map(({ check, os }) => ({ check, os })));
  const ctx = structuredClone(context);
  const policyDigest = digest({ policy: selectedPolicy.policyDigest, sources: anchors });
  const matrixDigest = digest(workflows);
  const contextDigest = digest(ctx);
  const expected = freeze({ schema: FULL_SCHEMA, authoritative: true, resolved: true,
    event: ctx.event, baseRef: ctx.baseRef, headSha: ctx.headSha, baseSha: ctx.baseSha,
    policyDigest, matrixDigest, contextDigest, inventory, required: inventory, nonImpact: [],
    workflows, context: ctx, gate: selectedPolicy.gate, policy: selectedPolicy.policy,
    policyId: selectedPolicy.policy.id, policyVersion: selectedPolicy.policy.version, profileId: selectedPolicy.policy.profile,
    independentControls: selectedPolicy.independentControls });
  const handle = Object.freeze({ gate: expected.gate, policy: expected.policy, policyDigest, matrixDigest, contextDigest });
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
    policyId: e.policyId, policyVersion: e.policyVersion, profileId: e.profileId,
    selected: structuredClone(e.inventory), excluded: [] };
}
