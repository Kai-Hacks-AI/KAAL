// kaal-graph: the Edges embedded in Nodes, their structural and reference checks,
// derived indexes, lookup, traversal and Node construction. It works on Node identities as identify(bytes)
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
// first: queries expose declared relationships, and check() is the resolver. What a query
// returns is the caller's own: a fresh array of frozen records, so changing it never
// changes the indexes. What a Graph holds cannot change either: it takes only frozen
// Nodes, as identify() returns them, so a Node and the indexes derived from it always agree.

import { isDeepStrictEqual } from "node:util";
import { stringify } from "yaml";
import { FormError, identify, isId, isName } from "./node.mjs";

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

/**
 * Whether `v` is immutable data as identify() returns it: a primitive, or a frozen
 * object or array whose values are too, with no object inside itself. A cycle is not
 * Form, so it is refused rather than followed.
 */
function immutable(v, path = new WeakSet()) {
  if (typeof v !== "object" || v === null) return true;
  if (!Object.isFrozen(v) || path.has(v)) return false;
  path.add(v);
  const ok = Object.values(v).every((x) => immutable(x, path));
  path.delete(v);
  return ok;
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

  /**
   * Add a Node. Adding the same id again is a no-op. The Node must be frozen, and
   * its type and frontmatter frozen throughout, as identify() returns it: a Node is
   * immutable content, and the indexes are read from it once. A Node may carry fields
   * of the caller's own beside its identity; Graph never reads them. Throws a
   * TypeError, adding nothing, for a Node that could still change.
   */
  add(node) {
    if (!Object.isFrozen(node) || !immutable(node.type) || !immutable(node.frontmatter)) {
      throw new TypeError(`Graph takes only frozen Nodes, as identify() returns them: ${node?.name} (${node?.id}) could still change`);
    }
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

/** A string in YAML's double-quoted style, which JSON's escapes are a subset of: read back exactly, never as another type. */
const quoted = (v) => JSON.stringify(v);
const refLines = (r, indent) => `${indent}name: ${quoted(r.name)}\n${indent.replace(/- $/, "  ")}id: ${quoted(r.id)}\n`;

/**
 * Construct a Node's exact bytes: { bytes, node }, the node being identify(bytes).
 * The frontmatter is `name`, then `type` if given, then `edges` if any, then every
 * other key in `frontmatter`, sorted. Edge groups are sorted by type and targets
 * within a group by reference; names and ids are always double-quoted, so an id
 * of digits stays a string. The body follows a blank line, `# <name>` by default.
 * Throws if the result would not be a Node in Form with well-formed Edges, or if
 * `frontmatter` names `name`, `type` or `edges`. It guarantees the Form and the
 * Edges' structure only: not that any reference resolves to a Node, nor that a
 * relationship is permitted. Writes nothing and gives no Node or Edge a meaning:
 * publishing the bytes is the caller's.
 */
export function createNode({ name, type, edges = [], frontmatter = {}, body = `# ${name}\n` }) {
  for (const key of ["name", "type", "edges"]) if (Object.hasOwn(frontmatter, key)) throw new FormError(`frontmatter cannot set ${key}: it is its own argument`);
  let text = `---\nname: ${quoted(name)}\n`;
  if (type !== undefined) text += `type:\n${refLines(type, "  ")}`;
  const groups = [...edges].sort((a, b) => byRef(a.type, b.type));
  if (groups.length) {
    text += "edges:\n";
    for (const g of groups) {
      text += `  - type:\n${refLines(g.type, "      ")}    targets:\n`;
      for (const t of [...(g.targets ?? [])].sort(byRef)) text += refLines(t, "      - ");
    }
  }
  const rest = Object.fromEntries(Object.keys(frontmatter).sort().map((k) => [k, frontmatter[k]]));
  if (Object.keys(rest).length) text += stringify(rest, { version: "1.2", sortMapEntries: true, aliasDuplicateObjects: false, lineWidth: 0 });
  const bytes = Buffer.from(`${text}---\n${body === "" ? "" : `\n${body}`}`, "utf8");
  const node = identify(bytes);
  if (node.name !== name || node.type?.id !== type?.id || node.type?.name !== type?.name) throw new FormError("the name or type would not read back as given");
  const declared = edgesOf(node);
  if (declared.problems.length) throw new FormError(`the edges are not well-formed: ${declared.problems.join("; ")}`);
  if (!isDeepStrictEqual(Object.fromEntries(Object.keys(rest).map((k) => [k, node.frontmatter[k]])), rest)) throw new FormError("the frontmatter would not read back as given");
  return { bytes, node };
}
