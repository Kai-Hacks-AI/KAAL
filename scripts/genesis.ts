import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createAgents } from "../skills/using-agents/scripts/create-agents.js";
import { BRAIN_DIR, createBrain } from "../skills/using-brain/scripts/create-brain.js";
import { createNode } from "../skills/using-brain/scripts/create-node.js";

/** KAAL's repository entry point: KAAL's guidance, placed by using-agents. */
export const ROOT_GUIDANCE = "# KAAL\n\nUse BRAIN for KAAL context, including why KAAL uses its skills.\n";

/**
 * KAAL's Genesis: KAAL is born by composing the capabilities it chooses.
 * using-brain creates BRAIN, using-agents creates the repository's Agent entry
 * point from KAAL's guidance, and using-brain's birth path then births KAAL's
 * first knowledge into BRAIN, in order. KAAL's meaning lives here and in BRAIN,
 * never in the skills, so the skills stay reusable by systems that are not
 * KAAL. Genesis creates no directory and writes no file itself. It is all
 * or nothing: if any step refuses or fails, what the steps before it created
 * is removed again, so a failed Genesis leaves the repository as it was.
 */
export function genesis(repo = "."): void {
  const created: string[] = [];
  try {
    const root = createBrain(path.join(repo, BRAIN_DIR));
    created.push(path.dirname(root));
    created.push(createAgents(repo, ROOT_GUIDANCE));
    birth(root);
  } catch (e) {
    for (const item of created) fs.rmSync(item, { recursive: true, force: true });
    throw e;
  }
}

/** KAAL's Genesis knowledge, born in order into the BRAIN at `root`. */
function birth(root: string): void {
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
    slug: "using-seals",
    name: "using-seals",
    meaning: `# Using Seals

KAAL uses the **using-seals** skill so a learning, once closed, cannot change unnoticed: past understanding stays exactly as it was learned.

KAAL seals BRAIN on every push to \`main\`. Each lineage is a chain and each learning a unit, oldest first; a learning is closed when it is sealed. Only sealing on \`main\` writes seal state; every change is checked against the seals of the branch it targets.

The skill explains how sealing and checking work. This node records why KAAL uses it.
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
