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
  const sealed = new Set(Object.keys(files).filter((p) => p.startsWith("seals/")).map((p) => p.slice("seals/".length)));
  const problems = [checkBytes(files[KERNEL_PATH], readFileSync(GENESIS_SEAL, "utf8").trim(), KERNEL_PATH)];
  for (const n of candidates(files)) if (!admitted.has(n.id)) problems.push(`${n.path} is not an admitted Node: it is not a sealed genesis, nor typed by an admitted Node`);
  for (const n of candidates(files)) if (!sealed.has(n.id)) problems.push(`${n.path} is a bootstrap Node with no seal recorded`);
  for (const id of sealed) if (!admitted.has(id)) problems.push(`seals/${id} seals no admitted Node`);
  return problems.filter((p): p is string => p !== undefined);
}

/**
 * Seal the Nodes: record the ID of each Node as written, in birth order. One
 * pass over fixed bytes. A later Node carries an earlier Node's ID as a literal,
 * so the record is a consequence of birth and is never input to it.
 */
export function sealBootstrap(): void {
  const found = candidates(payload());
  writeFileSync(
    SEALS_SOURCE,
    `// Written by seal-kaal-bootstrap: the record of sealed Nodes, in birth order. Never edited by hand, and never read to produce a Node.\nexport const SEALED: string[] = [${found.map((n) => JSON.stringify(n.id)).join(", ")}];\n`,
  );
  writeFileSync(GENESIS_SEAL, sha256(payload()[KERNEL_PATH]) + "\n");
  for (const n of found) console.log(`${n.name} ${n.id}`);
}
