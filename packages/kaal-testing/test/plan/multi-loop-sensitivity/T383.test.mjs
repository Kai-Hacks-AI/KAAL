// Case testing/T383 tests: testing/N35. Consumer-agnostic boundary of the new Skill section.
import assert from "node:assert/strict";
import { HEADING, skillParts } from "./lib.mjs";

export const id = "testing/T383";
export const tests = ["testing/N35"];
export const title = "Testing loops is present and names no hardcoded KAAL repository paths";

export function run() {
  const { section } = skillParts();
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  assert.doesNotMatch(section, /\.kaal\/|engineering\/|\bpackages\//i, "the new Skill guidance names no hardcoded KAAL repository paths");
}
