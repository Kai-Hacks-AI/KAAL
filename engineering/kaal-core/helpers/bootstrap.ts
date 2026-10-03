// PROVISIONAL bootstrap policy: which artifacts KAAL seals and where the
// seals live. The mechanism is seal.ts; this is only the policy that applies
// it to Core's payload. A candidate to move to the future graph Skill.
import { readFileSync, writeFileSync } from "node:fs";
import { payload } from "kaal-core";
import { sealNode } from "../src/seal.js";
import { checkBytes } from "./seal.js";

/** The Kernel is genesis, deployed here relative to the KAAL directory. It is not a Node. */
export const KERNEL_PATH = "core/KERNEL.md";

/** The bootstrap's Nodes, handcrafted in order: Node 1 `Node`, Node 2 `Edge`. */
export const NODE_PATHS = ["core/Node.md", "core/Edge.md"];

/** The Kernel's genesis seal: a control seal kept outside the payload's seals/. */
const GENESIS_SEAL = new URL("../../kernel.sha256", import.meta.url);
/** Core's record of the sealed Node IDs, deployed as one marker `seals/<ID>` each. */
const SEALS_SOURCE = new URL("../../../../packages/kaal-core/src/seals.ts", import.meta.url);

/** The IDs a payload records as sealed: one marker file `seals/<ID>` each. */
export function sealedIds(files: Record<string, string>): string[] {
  return Object.keys(files)
    .filter((path) => path.startsWith("seals/"))
    .map((path) => path.slice("seals/".length));
}

/** The problems with Core's recorded seals against its payload; empty means none. */
export function checkBootstrap(): string[] {
  const files = payload();
  const problems = [checkBytes(files[KERNEL_PATH], readFileSync(GENESIS_SEAL, "utf8").trim(), KERNEL_PATH)];
  const sealed = sealedIds(files);
  NODE_PATHS.forEach((path, i) => problems.push(checkBytes(files[path], sealed[i] ?? "none recorded", path)));
  // Edge freezes Node 1's identity as its type: the claimed ID must be Node 1's actual ID.
  if (!files[NODE_PATHS[1]].includes(`\n  id: ${sealNode(files[NODE_PATHS[0]])}\n`)) problems.push(`${NODE_PATHS[1]} does not name Node 1's exact ID as its type`);
  if (sealed.length !== NODE_PATHS.length) problems.push(`${sealed.length} sealed IDs recorded for ${NODE_PATHS.length} Nodes`);
  return problems.filter((p): p is string => p !== undefined);
}

/**
 * Record the seals. Node 2 carries Node 1's ID, so one pass records Node 1's ID
 * and the next records Node 2's: run it twice (npm run seal-kaal-bootstrap).
 */
export function sealBootstrap(): void {
  const files = payload();
  const ids = NODE_PATHS.map((path) => sealNode(files[path]));
  writeFileSync(
    SEALS_SOURCE,
    `// Written by seal-kaal-bootstrap. Never edited by hand.\nexport const NODE_ID = ${JSON.stringify(ids[0])};\nexport const SEALED: string[] = [${ids.map((id) => JSON.stringify(id)).join(", ")}];\n`,
  );
  writeFileSync(GENESIS_SEAL, sealNode(files[KERNEL_PATH]) + "\n");
}
