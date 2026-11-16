// Case release/T457 (release/C34): no up-to-date, no bypass, enforce-on-create only where agreed
import assert from "node:assert/strict";
import { NAMES, set1, rule } from "./helper.mjs";


export const id = "release/T457";
export const tests = ["release/C34"];
export const title = 'strict is false everywhere, bypass lists are empty, and do_not_enforce_on_create is set only for the branch stocks';
export async function run() {
  const s = set1();
  for (const n of NAMES) {
    assert.deepEqual(s[n].bypass_actors, [], `${n}: no bypass`);
    const c = rule(s[n], "required_status_checks");
    if (c) assert.equal(c.parameters.strict_required_status_checks_policy, false, `${n}: no up to date`);
  }
  for (const n of ["integration", "hotfixing", "wiring"]) assert.equal(rule(s[n], "required_status_checks").parameters.do_not_enforce_on_create, true, n);
  assert.equal(rule(s.promotion, "required_status_checks").parameters.do_not_enforce_on_create, false, "promotion enforces on create, as old promotion");
}
