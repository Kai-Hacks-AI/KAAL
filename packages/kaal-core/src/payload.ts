import { fileURLToPath } from "node:url";
import { read } from "kaal-hosting";
import { claimsForm, identify, identifyRoot, sha256, type Ref } from "./node.js";

export type Files = Record<string, Buffer>;

/**
 * The foundational payload this package carries, laid out as it deploys into
 * `.kaal/`, read once through Hosting when Core is loaded.
 */
const CARRIED: Files = await read(fileURLToPath(new URL("../payload/", import.meta.url)));

/**
 * The foundational Core payload as files, keyed by `/`-separated path
 * relative to the Engine directory: the Kernel, the foundational Nodes, the
 * `CASE` Definition and the Engine's `AGENTS.md`, as carried. Nothing here authors or rewrites a byte.
 */
export function payload(): Files {
  return Object.fromEntries(
    Object.keys(CARRIED)
      .sort()
      .map((path) => [path, Buffer.from(CARRIED[path])]),
  );
}

export interface Foundation {
  /** SHA-256 of the Kernel's exact bytes. The Kernel is not a Node; this only recognizes it. */
  kernel: string;
  node: Ref;
  definition: Ref;
  capability: Ref;
  agent: Ref;
  skill: Ref;
  extension: Ref;
}

/** The genesis Node `Node`: the foundation's one root, which declares no type. */
const GENESIS = "core/Node.md";

let cached: Foundation | undefined;

/** The identities of the foundation, derived from the payload's exact bytes. */
export function foundation(): Foundation {
  if (cached) return cached;
  const files = payload();
  const nodes = Object.entries(files)
    .filter(([, bytes]) => claimsForm(bytes))
    .map(([path, bytes]) => (path === GENESIS ? identifyRoot : identify)(bytes));
  const ref = (name: string): Ref => {
    const found = nodes.filter((n) => n.name === name);
    if (found.length !== 1) throw new Error(`payload carries ${found.length} Nodes named ${name}`);
    return { name, id: found[0].id };
  };
  cached = {
    kernel: sha256(files["KAAL-KERNEL.md"]),
    node: ref("Node"),
    definition: ref("KAAL Definition"),
    capability: ref("KAAL Capability"),
    agent: ref("KAAL Agent"),
    skill: ref("KAAL Skill"),
    extension: ref("KAAL Extension"),
  };
  return cached;
}
