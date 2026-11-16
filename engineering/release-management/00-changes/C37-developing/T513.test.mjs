// Case release/T513 (release/C37): Integrating challenges Developing, so integrating requires both checks and the other rulesets still require only their own
import assert from "node:assert/strict";
import { judge, GOOD, NAMES, source, contexts, ctx } from "./helper.mjs";

export const id = "release/T513";
export const tests = ["release/C37"];
export const title = "integrating requires verify Stages (Integrating) and verify Stages (Developing), the other four rulesets only their own, and the judge fails an integrating that misses the second check";
export async function run() {
  assert.deepEqual(contexts(source("Integrating")), [ctx("Integrating"), ctx("Developing")]);
  for (const n of NAMES.filter((x) => x !== "Integrating")) assert.deepEqual(contexts(source(n)), [ctx(n)], `${n}: only its own check`);
  for (const n of NAMES) {
    const r = source(n);
    assert.deepEqual(r.bypass_actors, [], `${n}: no bypass`);
    assert.equal(r.rules[0].parameters.strict_required_status_checks_policy, false, `${n}: no up to date`);
  }
  const { judge: j } = await judge();
  const one = GOOD(); one.rulesets.Integrating.rules[0].parameters.required_status_checks.pop();
  assert.equal(j(one).kind, "fail", "integrating without the Developing check");
}
