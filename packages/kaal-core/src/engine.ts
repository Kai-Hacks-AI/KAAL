import { HostingError, read, readFile } from "kaal-hosting";
import { claimsForm, compareRefs, identify, KaalError, type Identity, type Ref } from "./node.js";
import { foundation, type Files } from "./payload.js";

/** An admitted Node, with where the Engine's files happen to hold it (not part of the Node). */
export interface EngineNode extends Identity {
  paths: string[];
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
 */
export function evaluate(files: Files): Engine {
  const genesis = foundation().node;
  const rejected: Rejection[] = [];
  const byId = new Map<string, EngineNode>();
  for (const [path, bytes] of Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (!claimsForm(bytes)) continue;
    let identity: Identity;
    try {
      identity = identify(bytes);
    } catch (e) {
      rejected.push({ path, reason: (e as Error).message });
      continue;
    }
    const seen = byId.get(identity.id);
    if (seen) seen.paths.push(path);
    else byId.set(identity.id, { ...identity, paths: [path] });
  }

  const admitted = new Map<string, EngineNode>();
  for (const n of byId.values()) if (!n.type && n.id === genesis.id && n.name === genesis.name) admitted.set(n.id, n);
  for (let grew = true; grew; ) {
    grew = false;
    for (const n of byId.values()) {
      if (admitted.has(n.id) || !n.type) continue;
      const type = admitted.get(n.type.id);
      if (type && type.name === n.type.name) (admitted.set(n.id, n), (grew = true));
    }
  }
  for (const n of byId.values()) {
    if (admitted.has(n.id)) continue;
    for (const path of n.paths) rejected.push({ path, reason: reasonFor(n, byId, admitted) });
  }

  const nodes = [...admitted.values()].sort(compareRefs);
  return {
    nodes,
    rejected: rejected.sort((a, b) => (a.path < b.path ? -1 : 1)),
    resolve(ref: Ref): EngineNode {
      const n = admitted.get(ref.id);
      if (!n) throw new KaalError(`no admitted Node has id ${ref.id}`);
      if (n.name !== ref.name) throw new KaalError(`Node ${ref.id} is named ${n.name}, not ${ref.name}`);
      return n;
    },
    named: (name) => nodes.filter((n) => n.name === name),
    typedBy: (ref) => nodes.filter((n) => n.type?.id === ref.id && n.type.name === ref.name),
  };
}

function reasonFor(n: EngineNode, all: Map<string, EngineNode>, admitted: Map<string, EngineNode>): string {
  if (!n.type) return `declares no type: only the genesis Node \`Node\` of this Core may`;
  const target = all.get(n.type.id);
  if (!target) return `type ${n.type.name} (${n.type.id}) resolves to no Node`;
  if (target.name !== n.type.name) return `type names ${n.type.name}, but Node ${n.type.id} is named ${target.name}`;
  if (!admitted.has(target.id)) return `type ${n.type.name} (${n.type.id}) is not admitted`;
  return "not admitted";
}

/** Whether `path` is a directory, as Hosting reads it: missing and a file are not. */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    await readFile(path);
    return false;
  } catch (e) {
    if (e instanceof HostingError && e.code === "NOT_FILE") return true;
    if (e instanceof HostingError && e.code === "MISSING") return false;
    throw e;
  }
}

/** Load the Engine held in an Engine directory (a host's `.kaal/`). */
export async function loadEngine(dir: string): Promise<Engine> {
  return evaluate(await read(dir));
}
