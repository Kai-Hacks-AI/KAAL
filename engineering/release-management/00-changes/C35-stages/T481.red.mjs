// Case release/T481 (release/C35): set 1 is four branch rulesets, each requiring only its own verify Stages check
import assert from "node:assert/strict";
import { NAMES, source, contexts, ctx } from "./helper.mjs";

export const id = "release/T481";
export const tests = ["release/C35"];
export const title = "set 1 is four branch rulesets, each requiring only its own verify Stages check";
export async function run() {
  for (const n of NAMES) {
    const r = source(n);
    assert.equal(r.name, n.toLowerCase());
    assert.deepEqual(r.bypass_actors, [], `${n}: no bypass`);
    assert.deepEqual(r.rules.map((x) => x.type), ["required_status_checks"], `${n}: nothing but one status-check rule`);
    assert.deepEqual(contexts(r), [ctx(n)], `${n}: exactly its own check`);
    assert.equal(r.rules[0].parameters.strict_required_status_checks_policy, false, `${n}: no up to date`);
  }
}
