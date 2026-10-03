import { writeFileSync } from "node:fs";
import { payload } from "kaal-core";
import { nodePaths, sealNode } from "./seal.js";

const files = payload();
const entries = nodePaths(files)
  .sort()
  .map((path) => `  ${JSON.stringify(path)}: ${JSON.stringify(sealNode(files[path]))},\n`);
writeFileSync(
  new URL("../../../../packages/kaal-core/src/seals.ts", import.meta.url),
  `// Written by seal-kaal-kernel. Never edited by hand.\nexport const SEALS: Record<string, string> = {\n${entries.join("")}};\n`,
);
