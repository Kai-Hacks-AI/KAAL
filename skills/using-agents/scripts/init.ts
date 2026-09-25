import { pathToFileURL } from "node:url";
import { createNode } from "../../using-brain/scripts/create-node.js";
import { ROOT } from "../../using-brain/scripts/brain.js";

export function init(root = ROOT): void {
  createNode({ root, lineage: "genesis", learning: "26/09/25/01", slug: "using-agents", name: "using-agents", meaning: `# Using Agents

KAAL uses the **using-agents** skill so agent guidance stays scoped and concise while KAAL-specific context and reasons remain in BRAIN.

The skill explains the generic mechanics of AGENTS.md. This node records why KAAL uses it.
` });
  createNode({ root, lineage: "genesis", learning: "26/09/25/01", slug: "bass", name: "bass", meaning: `# BASS

KAAL uses BASS as a structured ladder:

\`Bare < Agent < Skill < Script\`

Forward, KAAL uses what it has: move toward the most deterministic capability available for the work.

When something fails, that failure gives direction for improvement. Move back toward understanding far enough to find the responsible level, improve it, then use the ladder forward again.

BASS is KAAL's understanding. Skills remain independent of BASS and can be reused by systems that organize agents differently.
` });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) init();
