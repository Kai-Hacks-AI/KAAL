// kaal-graph: the Edges embedded in Nodes, their structural and reference checks,
// derived indexes, lookup and traversal. It works on Node identities as identify(bytes)
// returns them ({ id, name, type?, frontmatter }; see node.mjs) and touches no host.
//
// Complexity, with V Nodes and E Edges (one Edge per target): adding a Node with k
// Edges is O(k log k) for sorting its own Edges, plus O(1) average per Edge; lookup is
// O(1) average, by id or by reference; outgoing Edges are O(k); incoming Edges are O(k)
// once sorted, the sort done lazily on first read after a change; Nodes of a name, Nodes
// of a type and Edges of a type are O(k) in what they return, likewise sorted lazily;
// check() and a traversal are O(V + E).
//
// Every query answers with Edges as declared, read from their source Nodes. A declared
// reference may resolve to no Node present, or to a Node of another name: check() reports
// both, and nothing else verifies them, so a caller that needs resolved Edges runs check()
// first. What a query returns is the caller's own: a fresh array of frozen records, so
// changing it never changes the indexes.

import { isId, isName } from "./node.mjs";

export { claimsForm, FormError, identify, isId, isName, sha256 } from "./node.mjs";

const byRef = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
const byEdge = (key) => (a, b) => byRef(a.type, b.type) || byRef(a[key], b[key]);
const isMapping = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const keys = (v) => Object.keys(v).sort().join();
// A type is matched exactly: by id and by name, so a misnamed reference matches nothing.
const typeKey = (ref) => `${ref.id}\n${ref.name}`;
const byTypedEdge = (a, b) => byRef(a.source, b.source) || byRef(a.target, b.target);

/** Append to the list under key in an index, marking it unsorted. */
function index(map, unsorted, key, value) {
  const list = map.get(key);
  if (list) list.push(value);
  else map.set(key, [value]);
  unsorted.add(key);
}

/** The list under key in an index, sorted once after a change. */
function indexed(map, unsorted, key, compare) {
  const list = map.get(key) ?? [];
  if (unsorted.delete(key)) list.sort(compare);
  return list;
}

/** A reference, or why it is not one. */
function reference(v, where) {
  if (!isMapping(v) || keys(v) !== "id,name") return { problem: `${where} is not a reference of exactly name and id` };
  if (!isName(v.name)) return { problem: `${where} has no valid name` };
  if (!isId(v.id)) return { problem: `${where} has no lowercase hex SHA-256 id` };
  return { ref: Object.freeze({ name: v.name, id: v.id }) };
}

/**
 * The outgoing Edges a Node's frontmatter declares, sorted by type then target,
 * or the problems that make them unusable. Without `edges`, a Node has none.
 */
export function edgesOf(node) {
  const declared = node.frontmatter?.edges;
  if (declared === undefined) return { edges: [], problems: [] };
  if (!Array.isArray(declared) || declared.length === 0) return { edges: [], problems: ["edges is not a nonempty sequence of groups"] };
  const problems = [];
  const edges = [];
  const types = new Set();
  declared.forEach((group, g) => {
    const at = `edges[${g}]`;
    if (!isMapping(group) || keys(group) !== "targets,type") return problems.push(`${at} is not a group of exactly type and targets`);
    const type = reference(group.type, `${at}.type`);
    if (type.problem) return problems.push(type.problem);
    if (types.has(type.ref.id)) return problems.push(`${at} repeats type ${type.ref.name}`);
    types.add(type.ref.id);
    if (!Array.isArray(group.targets) || group.targets.length === 0) return problems.push(`${at}.targets is not a nonempty sequence`);
    const seen = new Set();
    group.targets.forEach((t, i) => {
      const target = reference(t, `${at}.targets[${i}]`);
      if (target.problem) return problems.push(target.problem);
      if (seen.has(target.ref.id)) return problems.push(`${at}.targets[${i}] repeats target ${target.ref.name}`);
      seen.add(target.ref.id);
      edges.push(Object.freeze({ type: type.ref, target: target.ref }));
    });
  });
  if (problems.length) return { edges: [], problems };
  return { edges: edges.sort(byEdge("target")), problems: [] };
}

/** A graph over Node identities. Indexes are derived from the Nodes and never replace them. */
export class Graph {
  #nodes = new Map();
  #named = new Map();
  #namedUnsorted = new Set();
  #out = new Map();
  #in = new Map();
  #unsorted = new Set();
  #malformed = new Map();
  #typed = new Map();
  #typedUnsorted = new Set();
  #edges = new Map();
  #edgesUnsorted = new Set();

  constructor(nodes = []) {
    for (const node of nodes) this.add(node);
  }

  /** Add a Node. Adding the same id again is a no-op. */
  add(node) {
    if (this.#nodes.has(node.id)) return this;
    this.#nodes.set(node.id, node);
    const { edges, problems } = edgesOf(node);
    if (problems.length) this.#malformed.set(node.id, problems);
    this.#out.set(node.id, edges);
    const source = Object.freeze({ name: node.name, id: node.id });
    index(this.#named, this.#namedUnsorted, node.name, source);
    if (node.type) index(this.#typed, this.#typedUnsorted, typeKey(node.type), source);
    for (const { type, target } of edges) {
      index(this.#in, this.#unsorted, target.id, Object.freeze({ type, source }));
      index(this.#edges, this.#edgesUnsorted, typeKey(type), Object.freeze({ source, target, type }));
    }
    return this;
  }

  /** The Node with this id, or undefined. */
  node(id) {
    return this.#nodes.get(id);
  }

  /**
   * The Node this reference resolves to: the one with its id, if that Node has its
   * name. Undefined when no Node present has the id, or when the reference misnames it.
   */
  resolve(ref) {
    const node = this.#nodes.get(ref.id);
    return node?.name === ref.name ? node : undefined;
  }

  /** The Nodes with exactly this name, as { name, id }, sorted by id: a name alone may name several. */
  named(name) {
    return [...indexed(this.#named, this.#namedUnsorted, name, byRef)];
  }

  /** The Edges going out of a Node as declared: { type, target }, sorted by type then target. */
  out(id) {
    return [...(this.#out.get(id) ?? [])];
  }

  /** The Edges declared into a Node: { type, source }, sorted by type then source. */
  in(id) {
    return [...indexed(this.#in, this.#unsorted, id, byEdge("source"))];
  }

  /**
   * The Nodes whose Core type is exactly this reference, by id and name, as
   * { name, id }, sorted by id. A misnamed reference matches none.
   */
  typed(ref) {
    return [...indexed(this.#typed, this.#typedUnsorted, typeKey(ref), byRef)];
  }

  /**
   * The Edges declared with exactly this type reference, by id and name, as
   * { source, target, type }, sorted by source then target. A misnamed reference matches none.
   */
  edges(ref) {
    return [...indexed(this.#edges, this.#edgesUnsorted, typeKey(ref), byTypedEdge)];
  }

  /**
   * Every finding, in a deterministic order: malformed edges, and references
   * that resolve to no Node present or to a Node of another name.
   */
  check() {
    const findings = [];
    const resolve = (ref, what) => {
      const n = this.#nodes.get(ref.id);
      if (!n) return `${what} ${ref.name} (${ref.id}) resolves to no Node`;
      if (n.name !== ref.name) return `${what} names ${ref.name}, but Node ${ref.id} is named ${n.name}`;
    };
    for (const id of [...this.#nodes.keys()].sort()) {
      const at = `${this.#nodes.get(id).name} (${id})`;
      for (const problem of this.#malformed.get(id) ?? []) findings.push(`${at}: ${problem}`);
      for (const { type, target } of this.#out.get(id)) {
        for (const problem of [resolve(type, "type"), resolve(target, "target")]) if (problem) findings.push(`${at}: ${problem}`);
      }
    }
    return [...new Set(findings)];
  }

  /**
   * Breadth-first from a Node, following declared Edges `out` (default) or `in`,
   * optionally only those of one type id. Yields { id, depth } once per reachable
   * Node present. It follows an Edge by its target's id, whatever name the Edge gives
   * it: check() is what reports a misnamed reference.
   */
  *traverse(start, { direction = "out", type } = {}) {
    if (!this.#nodes.has(start)) return;
    const seen = new Set([start]);
    const queue = [{ id: start, depth: 0 }];
    for (let head = 0; head < queue.length; head++) {
      const step = queue[head];
      yield step;
      const next = direction === "in" ? indexed(this.#in, this.#unsorted, step.id, byEdge("source")).map((e) => ({ t: e.type, n: e.source })) : this.#out.get(step.id).map((e) => ({ t: e.type, n: e.target }));
      for (const { t, n } of next) {
        if ((type && t.id !== type) || seen.has(n.id) || !this.#nodes.has(n.id)) continue;
        seen.add(n.id);
        queue.push({ id: n.id, depth: step.depth + 1 });
      }
    }
  }
}
