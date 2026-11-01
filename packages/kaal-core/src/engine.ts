import { Graph } from "kaal-graph";
import { FormError, readFrontmatter } from "kaal-graph/form";
import { read } from "kaal-hosting";
import { isTypeName, validate, type Finding, type Types } from "./frontmatter.js";
import { claimsForm, compareRefs, readNode, type Identity } from "./node.js";
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

/**
 * The state of a typed artifact's Type (core/F27–core/F30). Registered is first-stage ownership:
 * the Type Definition's Capability resolves and its name is the Type's prefix. It is not an
 * exclusive namespace claim.
 */
export type TypeState = "registered" | "unregistered" | "unknown" | "invalid";

/** A typed artifact: a file whose frontmatter names its Type as `<Capability>/<Type>` (core/F23). Never a Node. */
export interface Artifact {
  path: string;
  type: string;
  state: TypeState;
  findings: Finding[];
}

/** What admission found: the admitted Nodes, the rejected files and the typed artifacts. Looking Nodes up is Graph's: hold `nodes` in a Graph. */
export interface Engine {
  /** The admitted Nodes, in name then id order, each frozen as Graph takes it. */
  nodes: EngineNode[];
  rejected: Rejection[];
  /** The typed artifacts, in path order, each with its Type's state. */
  artifacts: Artifact[];
}

export interface EvaluateOptions {
  /** The owning Capabilities' schemas, in `kaal-core/frontmatter`'s shape. A supplied schema is always applied (core/F30). */
  types?: Types;
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
 * reference names, exactly by id and name. Admission is Core's alone: the
 * Engine holds only admitted Nodes.
 */
export function evaluate(files: Files, options: EvaluateOptions = {}): Engine {
  const genesis = foundation().node;
  const rejected: Rejection[] = [];
  const typed: { path: string; type: string; bytes: Uint8Array }[] = [];
  const found = new Map<string, { identity: Identity; paths: string[] }>();
  for (const [path, bytes] of Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (!claimsForm(bytes)) continue;
    const type = typeNamed(bytes);
    if (type !== undefined) {
      typed.push({ path, type, bytes });
      continue;
    }
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
  const graph = new Graph(nodes);
  return {
    nodes,
    rejected: rejected.sort((a, b) => (a.path < b.path ? -1 : 1)),
    artifacts: typed.map(({ path, type, bytes }) => ({ path, type, ...stateOf(type, bytes, graph, options.types) })),
  };
}

/**
 * The Type a file names, if it is a typed artifact: its frontmatter reads, and its `type` is a
 * string `<Capability>/<Type>` (core/F23). Where the file is never decides. Any other `type`,
 * such as `KAAL Skill` or `guard/check`, leaves the file a claimed Node (core/F24).
 */
function typeNamed(bytes: Uint8Array): string | undefined {
  try {
    const type = readFrontmatter(bytes).type;
    return isTypeName(type) ? type : undefined;
  } catch (e) {
    if (e instanceof FormError) return undefined;
    throw e;
  }
}

const isRef = (v: unknown): v is { name: string; id: string } =>
  typeof v === "object" && v !== null && !Array.isArray(v) && Object.keys(v).length === 2 && typeof (v as { name?: unknown }).name === "string" && typeof (v as { id?: unknown }).id === "string";

/** A typed artifact's state, from the admitted Nodes, its frontmatter and the supplied Types alone (core/F31). */
function stateOf(type: string, bytes: Uint8Array, graph: Graph<EngineNode>, types: Types | undefined): { state: TypeState; findings: Finding[] } {
  if (types !== undefined) {
    const result = validate(bytes, types);
    if (result.verdict === "invalid") return { state: "invalid", findings: [...result.findings] };
  }
  const prefix = type.slice(0, type.indexOf("/"));
  const unknown = (rule: string) => ({ state: "unknown" as const, findings: [{ key: "type", rule }] });
  const named = graph.named(type);
  if (named.length === 0) {
    return { state: "unregistered", findings: [{ key: "type", rule: `unregistered: no Type Definition named ${type}; register one with the ${prefix} Capability` }] };
  }
  if (named.length > 1) return unknown(`${named.length} Nodes are named ${type}; keep exactly one Type Definition`);
  const definition = graph.node(named[0].id)!;
  const f = foundation();
  if (definition.type?.id !== f.definition.id) return unknown(`${type} is not typed by ${f.definition.name}, so it is not a Type Definition`);
  const owner = definition.frontmatter.capability;
  if (!isRef(owner)) return unknown(`${type} names no owning Capability as capability: {name, id}`);
  const capability = graph.resolve(owner);
  if (!capability || capability.type?.id !== f.capability.id) return unknown(`${type}'s capability ${owner.name} (${owner.id}) resolves to no admitted ${f.capability.name}`);
  if (capability.name !== prefix) return unknown(`${type} is owned by ${capability.name}, not by ${prefix}`);
  return { state: "registered", findings: [] };
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
