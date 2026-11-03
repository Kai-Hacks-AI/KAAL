// Change isolation (F38-F45): pure orchestration over owner-pinned model views.
// Graph performs traversal. This module neither executes the subject nor proves
// repository provenance; authority and test execution always remain unassessed.
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';

const identity = /^[a-z][a-z0-9-]*\/[A-Z]+[1-9][0-9]*$/;
const namespace = /^[a-z][a-z0-9-]*$/;
const digest = /^[0-9a-f]{64}$/;
const roles = new Set(['intent', 'requirement', 'nonfunctional-requirement', 'defect', 'architecture', 'case', 'realization']);
const record = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const ref = x => record(x) && typeof x.name === 'string' && x.name.length > 0 && typeof x.id === 'string' && digest.test(x.id);
const list = x => Array.isArray(x) && Array.from(x).every(v => v !== undefined);
const canonical = x => JSON.stringify(normalize(x));
function normalize(x) {
  if (Array.isArray(x)) return x.map(normalize);
  if (record(x)) return Object.fromEntries(Object.keys(x).sort().map(k => [k, normalize(x[k])]));
  return x;
}
const ordered = xs => [...xs].sort((a, b) => canonical(a) < canonical(b) ? -1 : canonical(a) > canonical(b) ? 1 : 0);
const same = (a, b) => canonical(a) === canonical(b);
const relationKey = t => [t.source.id, t.type.id, t.target.id].join(':');
const unique = xs => new Set(xs).size === xs.length;
const statement = (xs, pattern) => list(xs) && xs.length > 0 && xs.every(x => typeof x === 'string' && pattern.test(x)) && unique(xs);

/** See docs/architecture.md for the normalized owner inventory contract. */
export function isolate(proposal, model) {
  const findings = [], elements = new Map(), byId = new Map(), interfaces = new Map(), traces = new Map();
  let modelDigest = null;
  const add = (kind, code, subject, reason) => findings.push({ kind, code, subject, reason });
  const unknown = (code, subject, reason) => add('unknown', code, subject, reason);
  const violated = (code, subject, reason) => add('violation', code, subject, reason);
  const result = (extra = {}) => normalize({
    assessment: findings.some(f => f.kind === 'violation') ? 'violated' : findings.length ? 'unknown' : 'isolated',
    scope: statement(proposal?.scope, namespace) ? [...proposal.scope].sort() : [],
    selected: [], impact: [], affectedOutside: [], dependencies: [], boundaries: [], externalReferences: [], obligations: [],
    findings: ordered([...new Map(findings.map(f => [canonical(f), f])).values()]),
    modelDigest,
    proposal: ref(proposal?.ref) ? { name: proposal.ref.name, id: proposal.ref.id } : null,
    sources: list(model?.sources) ? ordered(model.sources.filter(s => s && typeof s.owner === 'string' && ref(s.ref))
      .map(s => ({ owner: s.owner, ref: { name: s.ref.name, id: s.ref.id } }))) : [],
    authority: { status: 'unestablished', coverage: 'supplied-model-only',
      reason: 'Owner snapshot consistency does not establish repository provenance or complete conversion.' },
    execution: { status: 'not-assessed', reason: 'Isolation analysis executes no tests or subject.' },
    ...extra,
  });
  for (const [field, pattern] of [['alters', identity], ['scope', namespace]]) {
    const xs = proposal?.[field];
    if (!statement(xs, pattern))
      violated('malformed-' + field, field, 'Expected a nonempty unique owner-identity/namespace list; the whole statement is refused.');
  }
  if (findings.length) return result();
  const graph = model?.graph;
  if (!graph || !['resolve', 'check', 'out', 'traverse'].every(k => typeof graph[k] === 'function')) {
    unknown('graph-unavailable', 'model', 'A Graph public view is required; no fallback traversal is used.');
    return result();
  }
  try {
    const checked = graph.check();
    if (!list(checked)) throw new TypeError('Graph check returned no findings inventory');
    for (const f of checked) unknown('graph-finding', 'model', String(f));
    if (!ref(proposal.ref) || !ref(model.change) || !same(proposal.ref, model.change))
      unknown('stale-proposal', 'change', 'Proposal and model must bind the same exact Change reference.');
    const change = ref(proposal.ref) && graph.resolve(proposal.ref);
    if (!change || !same([...(change.frontmatter?.alters ?? [])].sort(), [...proposal.alters].sort()) ||
        !same([...(change.frontmatter?.scope ?? [])].sort(), [...proposal.scope].sort()))
      unknown('stale-proposal', 'change', 'The resolved Change Node must state this exact alters/scope proposal.');
    if (!list(model.owners) || !model.owners.length || !model.owners.every(x => typeof x === 'string' && namespace.test(x)) ||
        !unique(model.owners) || !list(model.sources)) {
      unknown('owner-inventory-unavailable', 'model', 'A unique expected-owner inventory and source references are required.');
      return result();
    }
    modelDigest = sha256(new TextEncoder().encode(canonical({
      change: model.change, owners: [...model.owners].sort(), sources: ordered(model.sources),
    })));
    for (const owner of [...model.owners].sort()) {
      const sources = model.sources.filter(s => s?.owner === owner);
      if (sources.length !== 1 || !ref(sources[0].ref)) {
        unknown('owner-source-unavailable', owner, 'Exactly one pinned owner inventory source is required.');
        continue;
      }
      const source = graph.resolve(sources[0].ref);
      const view = source?.frontmatter?.inventory;
      if (!record(view) || !['elements', 'interfaces', 'traces'].every(k => list(view[k]))) {
        unknown('owner-source-unavailable', owner, 'The referenced source must resolve and expose its normalized inventory.');
        continue;
      }
      for (const e of view.elements) {
        if (!record(e) || typeof e.identity !== 'string' || !identity.test(e.identity) ||
            !e.identity.startsWith(owner + '/') || !ref(e.ref) || e.ref.name !== e.identity ||
            !roles.has(e.kind) || !graph.resolve(e.ref) || elements.has(e.identity) || byId.has(e.ref.id)) {
          unknown('invalid-element', owner, 'Missing, duplicate, unowned or unresolved element in owner inventory.');
          continue;
        }
        const item = { identity: e.identity, owner, kind: e.kind, ref: { ...e.ref } };
        elements.set(e.identity, item); byId.set(e.ref.id, item);
      }
      for (const b of view.interfaces) {
        if (!record(b) || typeof b.identity !== 'string' || !identity.test(b.identity) ||
            !b.identity.startsWith(owner + '/') || !ref(b.ref) || b.ref.name !== b.identity ||
            !graph.resolve(b.ref) || elements.has(b.identity) || interfaces.has(b.identity) || byId.has(b.ref.id) ||
            typeof b.from !== 'string' || typeof b.to !== 'string' || !ref(b.contract) || !graph.resolve(b.contract)) {
          unknown('invalid-interface', owner, 'Interface identity, ownership, endpoints and pinned contract must resolve.');
          continue;
        }
        const item = { identity: b.identity, owner, kind: 'interface', ref: { ...b.ref } };
        byId.set(b.ref.id, item);
        interfaces.set(b.identity, { ...item, from: b.from, to: b.to, contract: { ...b.contract } });
      }
      for (const t of view.traces) {
        if (!record(t) || !ref(t.source) || !ref(t.type) || !ref(t.target) ||
            !t.source.name.startsWith(owner + '/') ||
            ![t.source, t.type, t.target].every(r => graph.resolve(r)) ||
            !(t.boundary === null || typeof t.boundary === 'string')) {
          unknown('invalid-trace', owner, 'Every relationship must resolve and declare its owner-projected boundary disposition.');
          continue;
        }
        const key = relationKey(t);
        if (traces.has(key)) unknown('duplicate-trace', owner, key);
        traces.set(key, { source: { ...t.source }, type: { ...t.type }, target: { ...t.target }, boundary: t.boundary });
      }
    }
    for (const s of model.sources)
      if (!s || !model.owners.includes(s.owner)) unknown('unexpected-owner-source', s?.owner ?? 'model', 'Source has no expected-owner disposition.');
    // Compare independent source inventory to the actual Graph view in both directions.
    const observed = new Set();
    for (const e of byId.values()) {
      const outgoing = graph.out(e.ref.id);
      if (!list(outgoing)) throw new TypeError('Graph out returned no inventory');
      for (const edge of outgoing) {
        const key = relationKey({ source: e.ref, ...edge });
        observed.add(key);
        const expected = traces.get(key);
        if (!expected || !same(expected.source, e.ref) || !same(expected.target, edge.target) || !same(expected.type, edge.type))
          unknown('undeclared-trace', e.identity, 'Graph relationship is absent/mismatched in the owner source: ' + key);
      }
    }
    for (const [key, t] of traces) {
      if (!observed.has(key)) unknown('missing-trace', t.source.name, 'Owner-declared relationship is absent from Graph: ' + key);
      if (!byId.has(t.source.id) || !byId.has(t.target.id))
        unknown('unowned-trace-endpoint', t.source.name, 'Trace endpoint is absent from the element/interface inventory.');
      if (t.boundary !== null) {
        const b = interfaces.get(t.boundary);
        if (!b || b.from !== t.source.name || b.to !== t.target.name)
          unknown('missing-interface', t.boundary, 'Boundary trace must name the matching inventoried interface and endpoints.');
      }
    }
    for (const b of interfaces.values()) {
      if (!elements.has(b.from) || !elements.has(b.to))
        unknown('interface-endpoint-unavailable', b.identity, 'Both interface endpoints need owned element records.');
      if (![...traces.values()].some(t => t.boundary === b.identity))
        unknown('untraced-interface', b.identity, 'Interface is not linked by an owner-declared boundary trace.');
    }
    const impactIds = new Set(), dependencyIds = new Set();
    const walk = (start, direction, into) => {
      for (const step of graph.traverse(start, { direction })) {
        if (!byId.has(step.id)) unknown('unowned-reachable-element', step.id, 'A reached Node lacks an owner inventory entry.');
        else into.add(step.id);
      }
    };
    for (const altered of proposal.alters) {
      const e = elements.get(altered) ?? interfaces.get(altered);
      if (!e) unknown('altered-element-unavailable', altered, 'Changed element is not found in owner evidence.');
      else walk(e.ref.id, 'in', impactIds);
    }
    const selectedOwners = new Set(proposal.scope);
    const selected = [...byId.values()].filter(e => selectedOwners.has(e.owner));
    const impact = [...impactIds].map(id => byId.get(id));
    for (const owner of selectedOwners) {
      if (!model.owners.includes(owner)) unknown('scope-owner-unavailable', owner, 'Selected capability has no expected owner source.');
      else if (!impact.some(e => e.owner === owner)) {
        if (findings.some(f => f.kind === 'unknown'))
          unknown('scope-impact-unresolved', owner, 'Incomplete evidence cannot establish whether the selected owner is impacted.');
        else violated('unsupported-scope', owner, 'No changed-element trace establishes potential impact on this selected owner.');
      }
    }
    for (const e of selected) walk(e.ref.id, 'out', dependencyIds);
    const boundaries = [...interfaces.values()].filter(b => {
      const from = elements.get(b.from), to = elements.get(b.to);
      return from && to && selectedOwners.has(from.owner) !== selectedOwners.has(to.owner);
    }).map(b => ({ ...b, direction: selectedOwners.has(elements.get(b.to).owner) ? 'incoming' : 'outgoing' }));
    const obligations = [];
    const oblige = (loop, kind, target, owner, boundary = null) =>
      obligations.push({ loop, kind, target, owner, boundary, status: 'not-assessed' });
    for (const e of selected) {
      if (e.kind === 'architecture' || e.kind === 'interface')
        oblige('architecture-conformance', 'architecture-boundary', e.identity, e.owner);
      else if (e.kind === 'defect') oblige('implementation', 'regression', e.identity, e.owner);
      else if (e.kind === 'realization') oblige('implementation', 'real-subject', e.identity, e.owner);
      else if (e.kind === 'case') oblige('implementation', 'case-execution', e.identity, e.owner);
      else oblige('capability-acceptance', 'behaviour', e.identity, e.owner);
    }
    for (const b of boundaries) {
      const inside = b.direction === 'incoming' ? b.to : b.from;
      const owner = elements.get(inside).owner;
      oblige('implementation', b.direction === 'incoming' ? 'driver' : 'controlled-collaborator', inside, owner, b.identity);
      oblige('capability-acceptance', 'contract', b.contract.name, b.owner, b.identity);
      oblige('capability-acceptance', 'real-integration', b.identity, owner, b.identity);
    }
    const externalReferences = [...traces.values()].filter(t => t.boundary === null &&
      byId.has(t.source.id) && byId.has(t.target.id) &&
      selectedOwners.has(byId.get(t.source.id).owner) !== selectedOwners.has(byId.get(t.target.id).owner));
    return result({
      selected: ordered(selected), impact: ordered(impact),
      affectedOutside: ordered(impact.filter(e => !selectedOwners.has(e.owner))),
      dependencies: ordered([...dependencyIds].map(id => byId.get(id))),
      boundaries: ordered(boundaries), externalReferences: ordered(externalReferences), obligations: ordered(obligations),
    });
  } catch (e) {
    unknown('model-unavailable', 'model', 'The supplied Graph/owner view cannot be assessed: ' + String(e.message));
    return result();
  }
}
