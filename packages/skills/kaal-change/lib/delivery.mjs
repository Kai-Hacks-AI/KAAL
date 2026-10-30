// Change Nodes, succession and delivery (change/C1, plan/delivery/).
//
// assess(nodes, { evidence }) reads the Change Nodes it is given, the
// Succeeds and Delivers Edges they state, and, when given, the evidence a
// caller selected from Testing. It is pure: it reads nothing from the host
// and writes nothing. Graph, its optional complement, represents the Nodes
// and resolves their Edges; every meaning and finding is Change's.

import { CHANGE, DELIVERS, SUCCEEDS } from "./definitions.mjs";

/** The optional complement, by the name it is installed under. */
export const PEER = "kaal-graph";

/** What a consumer without Graph can do next (change/F29): install it and assess again, or analyze the Bare content. */
const NEXT = Object.freeze([Object.freeze({ action: "install", peer: PEER }), Object.freeze({ action: "analyze" })]);

// Graph is loaded once, when this module is. Only Graph's own absence becomes
// cannot-assess; any other failure, including a missing dependency of Graph,
// propagates (change/A12).
let graph;
try {
  graph = await import(PEER);
} catch (error) {
  if (error?.code !== "ERR_MODULE_NOT_FOUND" || !String(error.message).includes(`'${PEER}'`)) throw error;
}

const IDENTITY = /^[a-z][a-z0-9-]*\/C[1-9][0-9]*$/;
const HELD = Object.freeze(["priority", "rank", "order", "state", "delivered"]);

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value !== "";
const same = (a, b) => a?.name === b.name && a?.id === b.id;
const sorted = (values) => [...new Set(values)].sort(compare);

/** Assesses Change Nodes (change/A2). Without Graph, the one finding is cannot-assess, and there is no verdict, view or exchange. */
export function assess(nodes, { evidence } = {}) {
  if (!graph) return { findings: [{ kind: "cannot-assess", peer: PEER, next: NEXT.map((step) => ({ ...step })) }] };
  const given = new graph.Graph(nodes);
  const findings = [];

  // change/F1, change/F2: a Change is a Node typed by the Change Definition, under a well-formed, unique identity.
  const byIdentity = new Map();
  for (const ref of given.typed(CHANGE)) {
    const node = given.node(ref.id);
    byIdentity.set(node.name, [...(byIdentity.get(node.name) ?? []), node]);
  }
  const walked = new Map();
  for (const [identity, found] of [...byIdentity].sort(([a], [b]) => compare(a, b))) {
    if (!IDENTITY.test(identity)) findings.push({ kind: "malformed", change: identity, reason: "not <namespace>/C<n>" });
    else if (found.length > 1) findings.push({ kind: "duplicate", change: identity, ids: sorted(found.map((n) => n.id)) });
    else walked.set(identity, found[0]);
  }

  /** An Edge's target as Graph resolves it, or the finding it is (change/F4, change/F14). */
  const target = (identity, edge) => {
    const node = given.resolve(edge.target);
    if (node) return node;
    const kind = given.named(edge.target.name).length ? "stale" : "unresolved";
    findings.push({ kind, change: identity, target: edge.target.name, id: edge.target.id });
    return undefined;
  };

  const predecessors = new Map();
  const held = new Map();
  const intents = new Map();
  const requires = new Map();
  for (const [identity, node] of walked) {
    // change/F3: what a Change Node does not hold.
    for (const key of HELD) if (Object.hasOwn(node.frontmatter, key)) findings.push({ kind: "held-key", change: identity, key });

    // change/F4: its predecessors, the targets of its Succeeds Edges that are walked Changes.
    const direct = [];
    const holding = [];
    for (const edge of given.out(node.id).filter((e) => same(e.type, SUCCEEDS))) {
      const found = target(identity, edge);
      if (!found) holding.push(edge.target.name);
      else if (!same(found.type, CHANGE)) {
        findings.push({ kind: "not-a-change", change: identity, target: found.name, id: found.id, reason: "not a Change" });
        holding.push(found.name);
      } else if (walked.get(found.name)?.id === found.id) direct.push(found.name);
      else holding.push(found.name);
    }
    predecessors.set(identity, sorted(direct));
    held.set(identity, sorted(holding));

    // change/F14: the Intents it delivers. Whether a target is an Intent is the Intent capability's.
    const delivers = [];
    for (const edge of given.out(node.id).filter((e) => same(e.type, DELIVERS))) {
      const found = target(identity, edge);
      if (found) delivers.push(found.name);
    }
    intents.set(identity, sorted(delivers));

    // change/F15: its required Test Cases.
    const stated = node.frontmatter.requires;
    const cases = Array.isArray(stated) ? stated : [];
    if (cases.length === 0 && evidence != null) findings.push({ kind: "no-tests", change: identity });
    const seen = new Set();
    for (const entry of cases) {
      if (!isText(entry) || seen.has(entry)) findings.push({ kind: "malformed-test", change: identity, entry });
      seen.add(entry);
    }
    requires.set(identity, sorted(cases.filter(isText)));
  }

  // change/F5: the incoming view is derived from the stated Edges, never stated.
  const successors = new Map([...walked.keys()].map((identity) => [identity, []]));
  for (const [identity, direct] of predecessors) for (const p of direct) successors.get(p).push(identity);

  /** Everything reachable from a Change through one view, never the Change itself, each once. */
  const closure = (view, start) => {
    const seen = new Set();
    const queue = [...(view.get(start) ?? [])];
    while (queue.length) {
      const next = queue.shift();
      if (next === start || seen.has(next)) continue;
      seen.add(next);
      queue.push(...view.get(next));
    }
    return sorted(seen);
  };

  // change/F12: a cycle among resolved Succeeds Edges names each of its Changes.
  const ahead = new Map([...walked.keys()].map((identity) => [identity, closure(predecessors, identity)]));
  const onCycle = new Set();
  for (const identity of walked.keys()) {
    if (onCycle.has(identity)) continue;
    const back = ahead.get(identity).filter((p) => ahead.get(p).includes(identity));
    if (!predecessors.get(identity).includes(identity) && back.length === 0) continue;
    const members = sorted([identity, ...back]);
    for (const member of members) onCycle.add(member);
    findings.push({ kind: "cycle", change: members[0], changes: members });
  }
  findings.sort((a, b) => compare(a.kind, b.kind) || compare(a.change, b.change) || compare(JSON.stringify(a), JSON.stringify(b)));

  const delivery = evidence == null ? undefined : deliver({ evidence, walked, requires, predecessors, held, onCycle, findings });
  const view = (map) => (identity, { transitive = false } = {}) => (transitive ? closure(map, identity) : (map.get(identity) ?? []).filter((x) => x !== identity));
  const identities = [...walked.keys()];

  return {
    changes: identities.map((identity) => ({ identity, id: walked.get(identity).id })),
    findings,
    has: (identity) => walked.has(identity),
    succeeds: view(predecessors),
    successors: view(new Map([...successors].map(([k, v]) => [k, sorted(v)]))),
    delivers: (identity) => [...(intents.get(identity) ?? [])],
    delivery: (identity) => (delivery?.has(identity) ? structuredClone(delivery.get(identity)) : undefined),
    // change/F13: plain, sorted, deterministic data.
    exchange: () => ({
      changes: identities.map((identity) => ({
        identity,
        id: walked.get(identity).id,
        succeeds: predecessors.get(identity).filter((x) => x !== identity),
        delivers: [...intents.get(identity)],
        requires: [...requires.get(identity)],
        ...(delivery ? structuredClone(delivery.get(identity)) : {}),
      })),
      findings: structuredClone(findings),
    }),
  };
}

/** Whether an evaluation can count (change/F27): evaluated, of a named Run and Plan, with no finding. */
const counts = (e) => isObject(e) && isText(e.run) && isText(e.plan) && isText(e.result) && isObject(e.cases) && Array.isArray(e.findings) && e.findings.length === 0;

/** Delivery for every walked Change, from the evidence the caller selected (change/F16, change/F17, change/F28). */
function deliver({ evidence, walked, requires, predecessors, held, onCycle, findings }) {
  const by = isObject(evidence) && isText(evidence.by) ? evidence.by : null;
  const selected = by !== null && Array.isArray(evidence.evaluations);
  const evaluations = selected ? evidence.evaluations : [];

  // change/F28: one evaluation per Plan. More than one is a conflict Change never resolves.
  const perPlan = new Map();
  for (const e of evaluations) if (isObject(e) && isText(e.plan)) perPlan.set(e.plan, (perPlan.get(e.plan) ?? 0) + 1);
  const conflicting = new Set();
  const uncounted = new Set();
  const counted = new Map();
  for (const e of evaluations) {
    const cases = isObject(e) && isObject(e.cases) ? Object.keys(e.cases) : [];
    if (isObject(e) && perPlan.get(e.plan) > 1) for (const c of cases) conflicting.add(c);
    else if (!counts(e)) for (const c of cases) uncounted.add(c);
    else for (const [c, result] of Object.entries(e.cases)) counted.set(c, [...(counted.get(c) ?? []), { result, run: e.run }]);
  }

  const own = new Map();
  for (const identity of walked.keys()) {
    const unmet = [];
    const basis = [];
    for (const c of requires.get(identity)) {
      const results = counted.get(c);
      if (!selected) unmet.push({ case: c, result: "unevaluated" });
      else if (conflicting.has(c)) unmet.push({ case: c, result: "conflicting" });
      else if (!results) unmet.push({ case: c, result: uncounted.has(c) ? "unevaluated" : "absent" });
      else {
        const other = sorted(results.map((r) => r.result).filter((r) => r !== "passed"));
        if (other.length) unmet.push({ case: c, result: other[0] });
        else basis.push(...results.map((r) => r.run));
      }
    }
    const malformed = findings.some((f) => f.kind === "malformed-test" && f.change === identity);
    own.set(identity, { satisfied: requires.get(identity).length > 0 && unmet.length === 0 && !malformed, unmet, basis: sorted(basis) });
  }

  // change/F17: delivered when satisfied and every predecessor is delivered. Nothing on a cycle is.
  const delivered = new Map();
  const isDelivered = (identity) => {
    if (!delivered.has(identity)) {
      delivered.set(identity, false);
      delivered.set(identity, own.get(identity).satisfied && !onCycle.has(identity) && held.get(identity).length === 0 && predecessors.get(identity).every(isDelivered));
    }
    return delivered.get(identity);
  };

  return new Map([...walked.keys()].map((identity) => {
    const { satisfied, unmet, basis } = own.get(identity);
    const awaiting = sorted([...held.get(identity), ...predecessors.get(identity).filter((p) => !isDelivered(p))]);
    return [identity, { satisfied, delivered: isDelivered(identity), unmet, awaiting, by, basis }];
  }));
}
