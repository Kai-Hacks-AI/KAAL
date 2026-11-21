// Case testing/T381 tests: testing/F156. Heading placement and frontmatter description alignment only; teaching quality is judged by the Skill trial.
import assert from "node:assert/strict";
import { HEADING, OLD_HEADING, skillParts } from "./lib.mjs";

export const id = "testing/T381";
export const tests = ["testing/F156"];
export const title = "the Skill updates frontmatter description and replaces The three loops with Testing loops in place";

export function run() {
  const { text, headings, section } = skillParts();
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(fm, "SKILL.md has YAML frontmatter");
  const desc = fm[1].match(/^description:\s*([\s\S]*?)(?=^[A-Za-z0-9_-]+:|(?![\s\S]))/m);
  assert.ok(desc, "SKILL.md frontmatter declares description");
  assert.doesNotMatch(desc[1], /\bthree loops\b/i, 'SKILL.md frontmatter description still says "three loops"');
  assert.ok(!headings.includes(OLD_HEADING), `the Skill still carries "${OLD_HEADING}" instead of "${HEADING}"`);
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  const assess = headings.indexOf("Assessing a test against its claim");
  const loops = headings.indexOf(HEADING);
  const accept = headings.indexOf("Running acceptance");
  assert.ok(assess >= 0 && loops === assess + 1 && loops < accept, `"${HEADING}" stands right after "Assessing a test against its claim" and before "Running acceptance"`);
}
