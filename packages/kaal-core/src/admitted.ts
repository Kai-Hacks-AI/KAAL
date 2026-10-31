// Core's index of the Nodes it has admitted, by name, id and type (core/A37). Looking a Node up is
// all Core needs; Edges, navigation and analysis stay Graph's, used beside Core when present.
import type { Identity, Ref } from "#node/node";

const byRef = (a: Ref, b: Ref) => (a.id < b.id ? -1 : a.id > b.id ? 1 : a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
// A type is matched exactly: by id and by name, so a misnamed reference matches nothing.
const typeKey = (ref: Ref) => `${ref.id}\n${ref.name}`;

const add = (map: Map<string, Ref[]>, key: string, ref: Ref) => {
  const list = map.get(key);
  if (list) list.push(ref);
  else map.set(key, [ref]);
};

/** Admitted Nodes, each once by id, looked up by id, by reference, by name and by type. */
export class Admitted<N extends Identity = Identity> {
  readonly #nodes = new Map<string, N>();
  readonly #named = new Map<string, Ref[]>();
  readonly #typed = new Map<string, Ref[]>();

  constructor(nodes: Iterable<N> = []) {
    for (const node of nodes) {
      if (this.#nodes.has(node.id)) continue;
      this.#nodes.set(node.id, node);
      const ref = Object.freeze({ name: node.name, id: node.id });
      add(this.#named, node.name, ref);
      if (node.type) add(this.#typed, typeKey(node.type), ref);
    }
    for (const list of [...this.#named.values(), ...this.#typed.values()]) list.sort(byRef);
  }

  /** The Node with this id, or undefined. */
  node(id: string): N | undefined {
    return this.#nodes.get(id);
  }

  /** The Node this reference resolves to: the one with its id, if that Node has its name. */
  resolve(ref: Ref): N | undefined {
    const node = this.#nodes.get(ref.id);
    return node?.name === ref.name ? node : undefined;
  }

  /** The Nodes with exactly this name, sorted by id: a name alone may name several. */
  named(name: string): Ref[] {
    return [...(this.#named.get(name) ?? [])];
  }

  /** The Nodes typed by exactly this reference, by id and name, sorted by id. */
  typed(ref: Ref): Ref[] {
    return [...(this.#typed.get(typeKey(ref)) ?? [])];
  }
}
