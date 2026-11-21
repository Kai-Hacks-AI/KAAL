// Case testing/T378 tests: testing/F152. Checks structure and concepts only, never incidental prose.
import assert from "node:assert/strict";
import { HEADING, OLD_HEADING, skillParts } from "./lib.mjs";

export const id = "testing/T378";
export const tests = ["testing/F152"];
export const title = "the Skill replaces The three loops with composable Testing loops covering upward/lateral targets and separate evidence";

export function run() {
  const { headings, section } = skillParts();
  assert.ok(!headings.includes(OLD_HEADING), `the Skill still carries "${OLD_HEADING}" instead of "${HEADING}"`);
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  const assess = headings.indexOf("Assessing a test against its claim");
  const loops = headings.indexOf(HEADING);
  const accept = headings.indexOf("Running acceptance");
  assert.ok(assess >= 0 && loops === assess + 1 && loops < accept, `"${HEADING}" stands right after "Assessing a test against its claim" and before "Running acceptance"`);

  for (const loop of ["src", "architecture", "requirements", "intent", "defect"]) {
    assert.match(section, new RegExp(`\\b${loop}\\b`, "i"), `the section illustrates the ${loop} loop boundary`);
  }
  assert.match(section, /composable|extensible|on top|multiple|more than one|lateral/i, "the section explains that loops compose upward, laterally, or with further loops on top");
  assert.match(section, /trace|tracing|traced/i, "the section requires tracing inner work to each loop it serves");
  assert.match(section, /separate/i, "the section requires keeping each loop's runnable evidence separate");
  assert.match(section, /substitute|stand in for/i, "the section forbids one loop standing in for another");
}
