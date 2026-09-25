import { pathToFileURL } from "node:url";
import { ROOT } from "../skills/using-brain/scripts/brain.js";
import { createNode } from "../skills/using-brain/scripts/create-node.js";

/**
 * KAAL's Genesis: births KAAL's first knowledge into BRAIN, in order, through
 * the using-brain birth path. KAAL's meaning lives here and in BRAIN, never in
 * the skills, so the skills stay reusable by systems that are not KAAL.
 */
export function genesis(root = ROOT): void {
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
  createNode({
    root,
    lineage: "genesis",
    learning: "26/09/25/01",
    slug: "skill",
    name: "skill",
    meaning: `# Skill

KAAL expects a skill to provide a reusable capability while keeping KAAL-specific meaning in BRAIN.

When KAAL needs knowledge in order to use a skill, that knowledge is initialized into BRAIN rather than duplicated in the generic skill instructions. Deterministic mechanics belong in scripts where appropriate.
`,
  });
  createNode({
    root,
    lineage: "genesis",
    learning: "26/09/25/01",
    slug: "using-agents",
    name: "using-agents",
    meaning: `# Using Agents

KAAL uses the **using-agents** skill so agent guidance stays scoped and concise while KAAL-specific context and reasons remain in BRAIN.

The skill explains the generic mechanics of AGENTS.md. This node records why KAAL uses it.
`,
  });
  createNode({
    root,
    lineage: "genesis",
    learning: "26/09/25/01",
    slug: "bass",
    name: "bass",
    meaning: `# BASS

KAAL uses BASS as a structured ladder:

\`Bare < Agent < Skill < Script\`

Forward, KAAL uses what it has: move toward the most deterministic capability available for the work.

When something fails, that failure gives direction for improvement. Move back toward understanding far enough to find the responsible level, improve it, then use the ladder forward again.

BASS is KAAL's understanding. Skills remain independent of BASS and can be reused by systems that organize agents differently.
`,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) genesis();
