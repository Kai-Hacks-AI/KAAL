// Case release/T480 (release/C35): the stages declaration holds the five stages and their targets
import assert from "node:assert/strict";
import { stages } from "./helper.mjs";

export const id = "release/T480";
export const tests = ["release/C35"];
export const title = "the stages declaration holds the five stages and their targets";
export async function run() {
  const p = stages();
  const by = (n) => p.stages.find((x) => x.name === n);
  assert.deepEqual(p.stages.map((x) => x.name).sort(), ["Development", "Integration", "Promotion", "Publishing"]);
  assert.deepEqual(by("Integration").parts.map((x) => x.name), ["Collectors", "Hotfixing", "Wiring"]);
  assert.deepEqual(by("Integration").parts.map((x) => x.target), ["kaal/**", "hotfix/**", "wire/**"]);
  assert.equal(by("Promotion").target, "~DEFAULT_BRANCH");
  assert.equal(by("Publishing").target, "trial-*@*");
  assert.equal(by("Publishing").kind, "tag");
  assert.equal(by("Development").kind, ".githooks");
}
