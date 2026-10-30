// kaal-graph: reach, reverse and cycles over a directed structure of opaque string
// identities, given as successors: a Map, or a plain object, from each identity to the
// identities it points to. A successor that is not a key is an identity with no
// successors; resolving it is the caller's. Nothing here reads a Node or gives a
// relationship a meaning, and nothing imports another module.
//
// Determinism costs a sort: identities and each successor list are sorted by UTF-16
// code units, O(V log V + E log E), and every walk after it is O(V + E). No function
// recurses, so depth never exhausts the stack. Results are immutable: cycles are frozen
// arrays, and reverse is a read-only relation that offers no way to write. The input
// is never changed.

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** The structure with every identity a key, keys and successor lists sorted and without repeats. */
function normalize(successors) {
  const entries = successors instanceof Map ? [...successors] : Object.entries(successors);
  const adjacency = new Map();
  for (const [id, next] of entries) adjacency.set(id, [...new Set(next)].sort(compare));
  for (const next of [...adjacency.values()]) for (const id of next) if (!adjacency.has(id)) adjacency.set(id, []);
  return new Map([...adjacency].sort(([a], [b]) => compare(a, b)));
}

/**
 * Every cycle, as the strongly connected components that contain one: a component of
 * two or more members, or one member with an edge to itself. Each lists its members
 * once, sorted; the cycles are sorted by their first member. Paths are never
 * enumerated. Tarjan's algorithm, with an explicit stack in place of recursion.
 */
export function cycles(successors) {
  const adjacency = normalize(successors);
  const index = new Map();
  const low = new Map();
  const open = new Set();
  const stack = [];
  const found = [];
  let next = 0;
  const visit = (id) => {
    index.set(id, next);
    low.set(id, next++);
    stack.push(id);
    open.add(id);
  };
  for (const root of adjacency.keys()) {
    if (index.has(root)) continue;
    visit(root);
    const work = [{ id: root, at: 0 }];
    while (work.length) {
      const frame = work[work.length - 1];
      const out = adjacency.get(frame.id);
      if (frame.at < out.length) {
        const target = out[frame.at++];
        if (!index.has(target)) {
          visit(target);
          work.push({ id: target, at: 0 });
        } else if (open.has(target)) low.set(frame.id, Math.min(low.get(frame.id), index.get(target)));
        continue;
      }
      work.pop();
      if (work.length) {
        const parent = work[work.length - 1].id;
        low.set(parent, Math.min(low.get(parent), low.get(frame.id)));
      }
      if (low.get(frame.id) !== index.get(frame.id)) continue;
      const members = [];
      let member;
      do {
        member = stack.pop();
        open.delete(member);
        members.push(member);
      } while (member !== frame.id);
      if (members.length > 1 || out.includes(frame.id)) found.push(Object.freeze(members.sort(compare)));
    }
  }
  return Object.freeze(found.sort((a, b) => compare(a[0], b[0])));
}

/** `start` and every identity reachable from it, each once, breadth-first along sorted successors. */
export function* reach(successors, start) {
  const adjacency = normalize(successors);
  const seen = new Set([start]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    yield queue[head];
    for (const id of adjacency.get(queue[head]) ?? []) {
      if (seen.has(id)) continue;
      seen.add(id);
      queue.push(id);
    }
  }
}

/**
 * A read-only view of a relation from identity to frozen identities: Map's reading
 * interface (size, get, has, keys, values, entries, forEach, iteration) and nothing
 * that writes. The view and its prototype are frozen and the Map behind it is private,
 * so a caller can read it but never change it.
 */
class Relation {
  #map;

  constructor(map) {
    this.#map = map;
    Object.freeze(this);
  }

  get size() {
    return this.#map.size;
  }

  get(id) {
    return this.#map.get(id);
  }

  has(id) {
    return this.#map.has(id);
  }

  keys() {
    return this.#map.keys();
  }

  values() {
    return this.#map.values();
  }

  entries() {
    return this.#map.entries();
  }

  forEach(callback, thisArg) {
    for (const [id, list] of this.#map) callback.call(thisArg, list, id, this);
  }

  [Symbol.iterator]() {
    return this.#map.entries();
  }
}
Object.freeze(Relation.prototype);
Object.freeze(Relation);

/** The predecessors of every identity, sorted, as a read-only relation: incoming relationships derived, never stored. */
export function reverse(successors) {
  const adjacency = normalize(successors);
  const predecessors = new Map([...adjacency.keys()].map((id) => [id, []]));
  for (const [id, out] of adjacency) for (const target of out) predecessors.get(target).push(id);
  for (const list of predecessors.values()) Object.freeze(list);
  return new Relation(predecessors);
}
