// Case testing/T379 tests: testing/F153. Checks labelled sensitivity checkpoints and rules, never incidental prose.
import assert from "node:assert/strict";
import { HEADING, skillParts } from "./lib.mjs";

export const id = "testing/T379";
export const tests = ["testing/F153"];
export const title = "Testing loops teaches Behavioural RED (inert stub vs blocked) and Targeted Mutation Verification mapped to findings";

export function run() {
  const { section } = skillParts();
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  assert.match(section, /\*\*Behavioural RED[.:]?\*\*/i, 'the section carries a labelled "**Behavioural RED**" checkpoint');
  assert.match(section, /\*\*Targeted [Mm]utation(?: [Vv]erification)?[.:]?\*\*/i, 'the section carries a labelled "**Targeted Mutation**" checkpoint');

  assert.match(section, /inert stub|\binert\b/i, "Behavioural RED describes an inert stub or neutral unfixed subject");
  assert.match(section, /\bblocked\b/i, "Behavioural RED distinguishes a blocked run (missing module / syntax / setup error) from RED");
  assert.match(section, /assertion/i, "kill / Behavioural RED requires an assertion failure");

  for (const outcome of ["killed", "survived", "invalid", "unresolved"]) {
    assert.match(section, new RegExp(`\\b${outcome}\\b`, "i"), `mutation outcomes include ${outcome}`);
  }
  assert.match(section, /potential defect/i, "a surviving mutant is mapped to potential defect");
  assert.match(section, /references\/findings\.md/, "the section points to references/findings.md for findings classification");
  assert.match(section, /claim|requirement/i, "each mutant traces back to its owning claim or requirement");
}
