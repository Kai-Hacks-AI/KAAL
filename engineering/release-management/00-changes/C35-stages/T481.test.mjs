// Case release/T481 (release/C35): set 1 is six rulesets: five branch rulesets each requiring their own verify Stages check (Promoting also the analyze Vulnerabilities and verify Triggers checks), and Integrating covering all three integration families
import assert from "node:assert/strict";
import { NAMES, source, contexts, ctx } from "./helper.mjs";

export const id = "release/T481";
export const tests = ["release/C35"];
export const title = "set 1 is six rulesets: five branch rulesets each requiring their own verify Stages check (Promoting also the analyze Vulnerabilities and verify Triggers checks), and Integrating covering all three integration families";
export async function run() {
  for (const n of NAMES) {
    const r = source(n);
    assert.equal(r.name, n.toLowerCase());
    assert.deepEqual(r.bypass_actors, [], `${n}: no bypass`);
    assert.deepEqual(r.rules.map((x) => x.type), n === "Integrating" ? ["required_status_checks", "pull_request"] : ["required_status_checks"], `${n}: nothing but the status-check rule (Integrating also holds the approval rule of release/CTL10, release/C66)`);
    assert.deepEqual(contexts(r), n === "Integrating" ? [ctx(n), ctx("Developing")] : n === "Promoting" ? [ctx(n), "analyze Vulnerabilities (Promoting)", "verify Triggers"] : [ctx(n)], `${n}: exactly its own check (Integrating also requires Developing, release/C37; Promoting also requires analyze Vulnerabilities, release/CTL5)`);
    assert.equal(r.rules.find((x) => x.type === "required_status_checks").parameters.strict_required_status_checks_policy, false, `${n}: no up to date`);
  }
  assert.deepEqual(source("Integrating").conditions.ref_name.include, ["refs/heads/kaal/**", "refs/heads/hotfix/**", "refs/heads/wire/**"]);
  assert.deepEqual(source("Collecting").conditions.ref_name.include, ["refs/heads/kaal/**"]);
  assert.deepEqual(source("Hotfixing").conditions.ref_name.include, ["refs/heads/hotfix/**"]);
  assert.deepEqual(source("Wiring").conditions.ref_name.include, ["refs/heads/wire/**"]);
  assert.deepEqual(source("Promoting").conditions.ref_name.include, ["~DEFAULT_BRANCH"]);
}
