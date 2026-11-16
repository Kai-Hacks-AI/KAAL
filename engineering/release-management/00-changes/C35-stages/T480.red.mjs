// Case release/T480 (release/C35): the stages declaration holds the seven stages and their targets
import assert from "node:assert/strict";
import { stages } from "./helper.mjs";

export const id = "release/T480";
export const tests = ["release/C35"];
export const title = "the stages declaration holds the seven stages and their targets";
export async function run() {
  const p = stages();
  const by = (n) => p.stages.find((x) => x.name === n);
  assert.deepEqual(p.stages.map((x) => x.name), ["Developing", "Integrating", "Promoting", "Publishing"]);
  assert.equal(by("Developing").kind, ".githooks");
  assert.deepEqual(by("Integrating").targets, ["kaal/**", "hotfix/**", "wire/**"]);
  assert.deepEqual(by("Integrating").parts.map((x) => x.name), ["Collecting", "Hotfixing", "Wiring"]);
  assert.deepEqual(by("Integrating").parts.map((x) => x.target), ["kaal/**", "hotfix/**", "wire/**"]);
  assert.equal(by("Promoting").target, "~DEFAULT_BRANCH");
  assert.equal(by("Publishing").kind, "tag");
  assert.equal(by("Publishing").target, "trial-*@*");
}
