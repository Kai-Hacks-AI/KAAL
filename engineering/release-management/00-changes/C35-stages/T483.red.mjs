// Case release/T483 (release/C35): the judge passes the agreed structure and fails every departure and every unreadable input
import assert from "node:assert/strict";
import { judge, GOOD } from "./helper.mjs";

export const id = "release/T483";
export const tests = ["release/C35"];
export const title = "the judge passes the agreed structure and fails every departure and every unreadable input";
export async function run() {
  const { judge: j } = await judge();
  assert.equal(j(GOOD()).kind, "pass");
  const miss = GOOD(); delete miss.rulesets.Integrating;
  assert.equal(j(miss).kind, "fail", "a missing ruleset");
  const tgt = GOOD(); tgt.rulesets.Hotfixing.conditions.ref_name.include = ["refs/heads/other/**"];
  assert.equal(j(tgt).kind, "fail", "a wrong target");
  const fam = GOOD(); fam.rulesets.Integrating.conditions.ref_name.include.pop();
  assert.equal(j(fam).kind, "fail", "Integrating must cover all three families");
  const rule = GOOD(); rule.rulesets.Collecting.rules.push({ type: "deletion" });
  assert.equal(j(rule).kind, "fail", "an extra rule");
  const extra = GOOD(); extra.rulesets.Promoting.rules[0].parameters.required_status_checks.push({ context: "Guard", integration_id: 15368 });
  assert.equal(j(extra).kind, "fail", "an extra context");
  assert.equal(j({}).kind, "fail", "unreadable input fails closed");
}
