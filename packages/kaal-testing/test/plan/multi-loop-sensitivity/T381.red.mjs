// Case testing/T381 tests: testing/F156. Heading placement only; teaching quality is judged by the Skill trial.
import assert from "node:assert/strict";
import { HEADING, OLD_HEADING, skillParts } from "./lib.mjs";

export const id = "testing/T381";
export const tests = ["testing/F156"];
export const title = "the Skill replaces The three loops with Testing loops between Assessing a test against its claim and Running acceptance";

export function run() {
  const { headings, section } = skillParts();
  assert.ok(!headings.includes(OLD_HEADING), `the Skill still carries "${OLD_HEADING}" instead of "${HEADING}"`);
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  const assess = headings.indexOf("Assessing a test against its claim");
  const loops = headings.indexOf(HEADING);
  const accept = headings.indexOf("Running acceptance");
  assert.ok(assess >= 0 && loops === assess + 1 && loops < accept, `"${HEADING}" stands right after "Assessing a test against its claim" and before "Running acceptance"`);
}
