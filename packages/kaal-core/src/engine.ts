import { Graph } from "kaal-graph";
import { read } from "kaal-hosting";
import { claimsForm, compareRefs, KaalError, readNode, type Identity, type Ref } from "./node.js";
import { foundation, type Files } from "./payload.js";

/** An admitted Node, frozen as Graph holds it, with where the Engine's files happen to hold it (not part of the Node). */
export interface EngineNode extends Identity {
  readonly paths: readonly string[];
}

/** A file that claims to be a Node and is not admitted, with the reason. */
export interface Rejection {
  path: string;
  reason: string;
}

export interface Engine {
  /** The admitted Nodes, in name then id order. */
  nodes: EngineNode[];
  rejected: Rejection[];
  /** The admitted Node with exactly this id, its name checked; throws if there is none. */
  resolve(ref: Ref): EngineNode;
  /** The admitted Nodes with this name: a name alone may name several Nodes. */
  named(name: string): EngineNode[];
  /** The admitted Nodes whose type is exactly this reference. */
  typedBy(ref: Ref): EngineNode[];
}

/**
 * Admit the Nodes among `files`. A file claims to be a Node when it begins
 * with `---`; it must then be in Form. The genesis Node is admitted only as
 * Core's own `Node`, by its exact id; every other Node is admitted when its
 * type resolves, by id with the name checked, to an admitted Node. Files that
 * do not claim to be Nodes (the Kernel, prose, data) are not part of the graph.
 *
 * Reading a Node and looking Nodes up are Graph's: the candidates are
 * identified and held, frozen, in one Graph, which finds the Nodes a type
 * reference names, exactly by id and name. Admission is Core's alone, and
 * resolve, named and typedBy answer only with admitted Nodes.
 */
export function evaluate(files: Files): Engine {
  const genesis = foundation().node;
  const rejected: Rejection[] = [];
  const found = new Map<string, { identity: Identity; paths: string[] }>();
  for (const [path, bytes] of Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (!claimsForm(bytes)) continue;
    let identity: Identity;
    try {
      identity = readNode(bytes);
    } catch (e) {
      rejected.push({ path, reason: (e as Error).message });
      continue;
    }
    const seen = found.get(identity.id);
    if (seen) seen.paths.push(path);
    else found.set(identity.id, { identity, paths: [path] });
  }
  const candidates = new Graph<EngineNode>([...found.values()].map(({ identity, paths }) => Object.freeze({ ...identity, paths: Object.freeze(paths) })));

  // Admission walks the type graph outward from genesis: each Node is reached
  // through the Nodes it types, so every Node and type reference is visited once.
  const admitted = new Map<string, EngineNode>();
  const pending: EngineNode[] = [];
  const root = candidates.resolve(genesis);
  if (root && !root.type) (admitted.set(root.id, root), pending.push(root));
  while (pending.length) {
    const type = pending.pop()!;
    for (const ref of candidates.typed(type)) {
      if (!admitted.has(ref.id)) {
        const n = candidates.node(ref.id)!;
        admitted.set(n.id, n);
        pending.push(n);
      }
    }
  }
  for (const { identity } of found.values()) {
    if (admitted.has(identity.id)) continue;
    for (const path of found.get(identity.id)!.paths) rejected.push({ path, reason: reasonFor(identity, candidates, admitted) });
  }

  const nodes = [...admitted.values()].sort(compareRefs);
  const only = (refs: Ref[]) => refs.flatMap((r) => admitted.get(r.id) ?? []).sort(compareRefs);
  return {
    nodes,
    rejected: rejected.sort((a, b) => (a.path < b.path ? -1 : 1)),
    resolve(ref: Ref): EngineNode {
      const n = admitted.get(ref.id);
      if (!n) throw new KaalError(`no admitted Node has id ${ref.id}`);
      if (n.name !== ref.name) throw new KaalError(`Node ${ref.id} is named ${n.name}, not ${ref.name}`);
      return n;
    },
    named: (name) => only(candidates.named(name)),
    typedBy: (ref) => only(candidates.typed(ref)),
  };
}

function reasonFor(n: Identity, candidates: Graph<EngineNode>, admitted: Map<string, EngineNode>): string {
  if (!n.type) return `declares no type: only the genesis Node \`Node\` of this Core may`;
  const target = candidates.node(n.type.id);
  if (!target) return `type ${n.type.name} (${n.type.id}) resolves to no Node`;
  if (target.name !== n.type.name) return `type names ${n.type.name}, but Node ${n.type.id} is named ${target.name}`;
  if (!admitted.has(target.id)) return `type ${n.type.name} (${n.type.id}) is not admitted`;
  return "not admitted";
}

/** Load the Engine held in an Engine directory (a host's `.kaal/`). */
export async function loadEngine(dir: string): Promise<Engine> {
  return evaluate(await read(dir));
}
