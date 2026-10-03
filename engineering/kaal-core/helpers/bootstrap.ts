// PROVISIONAL, BIRTH-ONLY bootstrap policy: the Kernel's genesis seal, and the
// recording of the Nodes' seals into the Embedding. The mechanisms are
// seal.ts (bytes) and nodes.ts (admission). Remove with the bootstrap once
// the graph Skill seals Nodes itself.
import { readFileSync, writeFileSync } from "node:fs";
import { payload } from "kaal-core";
import { admit, candidates } from "./nodes.js";
import { checkBytes, sha256 } from "./seal.js";

/** The Kernel is genesis, deployed here relative to the KAAL directory. It is not a Node. */
const KERNEL_PATH = "core/KERNEL.md";
/** The Kernel's genesis seal: a control seal kept outside the payload's seals/. */
const GENESIS_SEAL = new URL("../../kernel.sha256", import.meta.url);
/** Core's record of the sealed Node IDs, deployed as one marker `seals/<ID>` each. */
const SEALS_SOURCE = new URL("../../../../packages/kaal-core/src/seals.ts", import.meta.url);

/** The problems with a payload's seals; empty means none. */
export function checkBootstrap(files: Record<string, string> = payload()): string[] {
  const admitted = new Set(admit(files).map((n) => n.id));
  const problems = [checkBytes(files[KERNEL_PATH], readFileSync(GENESIS_SEAL, "utf8").trim(), KERNEL_PATH)];
  for (const n of candidates(files)) if (!admitted.has(n.id)) problems.push(`${n.path} is not an admitted Node: it is not a sealed genesis, nor typed by an admitted Node`);
  for (const path of Object.keys(files)) if (path.startsWith("seals/") && !admitted.has(path.slice("seals/".length))) problems.push(`${path} seals no admitted Node`);
  return problems.filter((p): p is string => p !== undefined);
}

/**
 * Record the Nodes' seals. Node 2 carries Node 1's ID, so one pass records
 * Node 1's ID and the next records Node 2's: run it twice (npm run seal-kaal-bootstrap).
 */
export function sealBootstrap(): void {
  const found = candidates(payload());
  const ids = found.map((n) => n.id);
  writeFileSync(
    SEALS_SOURCE,
    `// Written by seal-kaal-bootstrap. Never edited by hand.\nexport const NODE_ID = ${JSON.stringify(found.find((n) => !n.type)?.id)};\nexport const SEALED: string[] = [${ids.map((id) => JSON.stringify(id)).join(", ")}];\n`,
  );
  writeFileSync(GENESIS_SEAL, sha256(payload()[KERNEL_PATH]) + "\n");
}
