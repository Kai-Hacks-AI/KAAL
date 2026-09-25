import { pathToFileURL } from "node:url";
import { ROOT } from "./brain.js";
import { createNode } from "./create-node.js";

export function init(root = ROOT): void {
  createNode({
    root,
    lineage: "genesis",
    learning: "26/09/25/01",
    slug: "using-brain",
    name: "using-brain",
    meaning: `# Using BRAIN

KAAL uses the **using-brain** skill so every BRAIN node is born through one mechanism, past understanding is retained, and mechanical structure can be validated.

The details of how BRAIN works belong to the skill. This node records why KAAL uses it; it does not duplicate the skill's instructions.
`,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) init();
