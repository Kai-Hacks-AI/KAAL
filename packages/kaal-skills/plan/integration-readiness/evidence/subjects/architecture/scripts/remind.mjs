// DRAFT of the mechanism Architecture would own (skills/C1 PLAN evidence): prints the reminder an integrator may hand an agent.
// Read-only and deterministic. It reads the Skill's own name, applies no placement rule and decides nothing.
// Usage: node scripts/remind.mjs [<statement or situation, as text>]
import { readFileSync } from 'node:fs';
const skill = readFileSync(new URL('../skills/kaal-architecture/SKILL.md', import.meta.url), 'utf8').match(/^name: (.+)$/m)[1].trim();
const section = 'The test';
const situation = process.argv[2] ?? null;
const reminder = `Before you settle this design or place this function, read ${skill}, '${section}': would the statement still hold if the means were replaced? Report its parts, your finding (none, mixed, ambiguous) and the next move (keep, split, ask).`;
process.stdout.write(`${JSON.stringify({ skill, section, situation, reminder })}\n`);
