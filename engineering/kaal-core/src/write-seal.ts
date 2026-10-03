import { writeFileSync } from "node:fs";
import { payload } from "kaal-core";
import { KERNEL_PATH, NODE_PATHS } from "./kernel.js";
import { sealNode } from "./seal.js";

const files = payload();

// Seal the bootstrap's Nodes. Node 2 carries Node 1's ID, so one pass records
// Node 1's ID and the next records Node 2's: run it twice (seal-kaal-kernel).
const ids = NODE_PATHS.map((path) => sealNode(files[path]));
writeFileSync(
  new URL("../../../../packages/kaal-core/src/seals.ts", import.meta.url),
  `// Written by seal-kaal-kernel. Never edited by hand.\nexport const NODE_ID = ${JSON.stringify(ids[0])};\nexport const SEALED: string[] = [${ids.map((id) => JSON.stringify(id)).join(", ")}];\n`,
);

// The Kernel's genesis seal: not a Node ID, and kept outside the payload's seals/.
writeFileSync(new URL("../../kernel.sha256", import.meta.url), sealNode(files[KERNEL_PATH]) + "\n");
