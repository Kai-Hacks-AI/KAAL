import { readFileSync, readdirSync, statSync } from "node:fs";
import { claimsForm, identify, sha256, type Ref } from "./node.js";

/** The foundational payload this package carries, laid out as it deploys into `.kaal/`. */
const PAYLOAD = new URL("../payload/", import.meta.url);

export type Files = Record<string, Buffer>;

/**
 * The foundational Core payload as files, keyed by `/`-separated path
 * relative to the Engine directory: the Kernel, the four foundational Nodes
 * and the Engine's `AGENTS.md`, as carried. Nothing here authors or rewrites a byte.
 */
export function payload(): Files {
  const files: Files = {};
  for (const path of readdirSync(PAYLOAD, { recursive: true, encoding: "utf8" }).sort()) {
    if (statSync(new URL(path, PAYLOAD)).isFile()) files[path.split("\\").join("/")] = readFileSync(new URL(path, PAYLOAD));
  }
  return files;
}

export interface Foundation {
  /** SHA-256 of the Kernel's exact bytes. The Kernel is not a Node; this only recognizes it. */
  kernel: string;
  node: Ref;
  definition: Ref;
  skill: Ref;
  extension: Ref;
}

let cached: Foundation | undefined;

/** The identities of the foundation, derived from the payload's exact bytes. */
export function foundation(): Foundation {
  if (cached) return cached;
  const files = payload();
  const nodes = Object.entries(files)
    .filter(([, bytes]) => claimsForm(bytes))
    .map(([, bytes]) => identify(bytes));
  const ref = (name: string): Ref => {
    const found = nodes.filter((n) => n.name === name);
    if (found.length !== 1) throw new Error(`payload carries ${found.length} Nodes named ${name}`);
    return { name, id: found[0].id };
  };
  cached = {
    kernel: sha256(files["KAAL-KERNEL.md"]),
    node: ref("Node"),
    definition: ref("KAAL Definition"),
    skill: ref("KAAL Skill"),
    extension: ref("KAAL Extension"),
  };
  return cached;
}
