// Case release/T487 (release/C35): Publishing exists in Engineering as a tag ruleset source with one rule and no check
import assert from "node:assert/strict";
import { source, judge, GOOD } from "./helper.mjs";

export const id = "release/T487";
export const tests = ["release/C35"];
export const title = "Publishing exists in Engineering as a tag ruleset source with one rule and no check";
export async function run() {
  const r = source("Publishing");
  assert.equal(r.name, "publishing");
  assert.equal(r.target, "tag");
  assert.deepEqual(r.conditions.ref_name.include, ["refs/tags/trial-*@*"]);
  assert.deepEqual(r.bypass_actors, []);
  assert.deepEqual(r.rules.map((x) => x.type), ["update"], "a tag ruleset needs a rule; update is the smallest: a published tag cannot be moved");
  const { judge: j } = await judge();
  const g = GOOD(); delete g.rulesets.Publishing;
  assert.equal(j(g).kind, "fail", "Publishing missing");
}
