import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SKILL = fileURLToPath(new URL("../SKILL.md", import.meta.url));

/** This skill's SKILL.md. The skill is born from init: SKILL.md is generated from here, never edited by hand. */
export const SKILL_MD = `---
name: using-agents
description: Use scoped AGENTS.md files as concise agent entry points that route repository work to authoritative context and capabilities.
---

# Using Agents

Use \`AGENTS.md\` to give an agent the minimum scoped guidance needed to enter a repository or directory correctly.

Keep \`AGENTS.md\` concise. It should route the agent to authoritative context or a capability rather than duplicate the meaning, rationale, or mechanics owned elsewhere.

Narrower \`AGENTS.md\` files provide guidance for their scope. When a skill owns a capability, point to the skill instead of reproducing its instructions.
`;

/** Generates this skill's SKILL.md at `target` (by default, next to this skill's scripts). */
export function init(target = SKILL): string {
  fs.writeFileSync(target, SKILL_MD);
  return target;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) init();
