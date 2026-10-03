import { writeFileSync } from "node:fs";
import { payload } from "kaal-core";
import { KERNEL_PATH, NODE_PATHS } from "./kernel.js";
import { sealNode } from "./seal.js";

const files = payload();

// Seal the bootstrap's Nodes: Core records their IDs and deploys a marker each.
const ids = NODE_PATHS.map((path) => JSON.stringify(sealNode(files[path])));
writeFileSync(
  new URL("../../../../packages/kaal-core/src/seals.ts", import.meta.url),
  `// Written by seal-kaal-kernel. Never edited by hand.\nexport const SEALED: string[] = [${ids.join(", ")}];\n`,
);

// The Kernel's genesis seal: not a Node ID, and kept outside the payload's seals/.
writeFileSync(new URL("../../kernel.sha256", import.meta.url), sealNode(files[KERNEL_PATH]) + "\n");
