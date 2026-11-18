// Case release/T513 (release/C37): Integrating challenges Developing, so integrating requires both checks and the other rulesets still require only their own
import assert from "node:assert/strict";
import { judge, GOOD, NAMES, stages, source, contexts, ctx } from "./helper.mjs";

export const id = "release/T513";
export const tests = ["release/C37"];
export const title = "integrating requires verify Stages (Integrating) and verify Stages (Developing), Promoting its own, analyze Vulnerabilities and verify Triggers, the other three rulesets only their own, and the judge fails an integrating that misses the second check";
export async function run() {
  const declaredChecks = stages().stages.find((s) => s.name === "Integrating").rules.flatMap((r) => (r.checks ?? []).map((c) => c.name));
  assert.deepEqual(declaredChecks, [ctx("Integrating"), ctx("Developing")], "stages.json declares what Integrating requires, as the checks of its rule (release/C70)");
  assert.deepEqual(contexts(source("Integrating")), [ctx("Integrating"), ctx("Developing")]);
  for (const n of NAMES.filter((x) => x !== "Integrating" && x !== "Promoting")) assert.deepEqual(contexts(source(n)), [ctx(n)], `${n}: only its own check`);
  assert.deepEqual(contexts(source("Promoting")), [ctx("Promoting"), "analyze Vulnerabilities (Promoting)", "verify Triggers"], "Promoting: its own check, analyze Vulnerabilities (release/CTL5) and verify Triggers (release/CTL20)");
  for (const n of NAMES) {
    const r = source(n);
    assert.deepEqual(r.bypass_actors, [], `${n}: no bypass`);
    assert.equal(r.rules[0].parameters.strict_required_status_checks_policy, false, `${n}: no up to date`);
  }
  const { judge: j } = await judge();
  const one = GOOD(); one.rulesets.Integrating.rules[0].parameters.required_status_checks.pop();
  assert.equal(j(one).kind, "fail", "integrating without the Developing check");
}
