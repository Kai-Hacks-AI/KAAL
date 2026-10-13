import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, type Dirent } from "node:fs";
import { join } from "node:path";
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

const STAGING_PREFIX = ".staging-";

/**
 * Create a staging directory inside `dir` for one of Core's atomic writes. Staging
 * is internal to how Core writes: it reserves no Node name, filename or path.
 */
export function makeStaging(dir: string): string {
  return mkdtempSync(join(dir, STAGING_PREFIX));
}

/** Whether a top-level entry of an Engine is one of Core's staging directories, never part of the graph. */
export function isStaging(entry: Dirent): boolean {
  return entry.isDirectory() && entry.name.startsWith(STAGING_PREFIX);
}

/** The files of an Engine directory, keyed by `/`-separated relative path. */
export function readTree(dir: string): Files {
  const files: Files = {};
  if (!existsSync(dir)) return files;
  // Only staging directories are reserved: a top-level file named like one is
  // scanned. Staging directories are never descended into, so one renamed away
  // by a concurrent write cannot fail the scan.
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (isStaging(entry)) continue;
    if (entry.isDirectory()) {
      for (const path of readdirSync(join(dir, entry.name), { recursive: true, encoding: "utf8" })) {
        const full = join(dir, entry.name, path);
        if (statSync(full).isFile()) files[`${entry.name}/${path.split("\\").join("/")}`] = readFileSync(full);
      }
    } else if (statSync(join(dir, entry.name)).isFile()) {
      files[entry.name] = readFileSync(join(dir, entry.name));
    }
  }
  return files;
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

/** Load the Engine held in an Engine directory (a host's `.kaal/`). */
export function loadEngine(dir: string): Engine {
  return evaluate(readTree(dir));
}
