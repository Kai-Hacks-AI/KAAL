// Case release/T459 (release/C34): promotion keeps its hard protections exactly
import assert from "node:assert/strict";
import { set1, baseline, rule } from "./helper.mjs";


export const id = "release/T459";
export const tests = ["release/C34"];
export const title = 'promotion keeps deletion, non_fast_forward, code-owner review, squash and rebase only, and the squash merge queue as old promotion';
export async function run() {
  const p = set1().promotion, old = baseline().find((r) => r.name === "old promotion");
  for (const t of ["deletion", "non_fast_forward"]) assert.ok(rule(p, t), t);
  const pr = rule(p, "pull_request").parameters;
  assert.equal(pr.require_code_owner_review, true);
  assert.deepEqual(pr.allowed_merge_methods.slice().sort(), ["rebase", "squash"]);
  assert.deepEqual(rule(p, "merge_queue").parameters, rule(old, "merge_queue").parameters);
}
