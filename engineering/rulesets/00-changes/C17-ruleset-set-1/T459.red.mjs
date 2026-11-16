// Case engineering/T459 (engineering/C17): promotion keeps its hard protections exactly
import { test } from "node:test";
import assert from "node:assert/strict";
import { set1, baseline, rule } from "./helper.mjs";

test("engineering/T459 [engineering/C17]: promotion keeps deletion, non_fast_forward, code-owner review, squash and rebase only, and the squash merge queue as old promotion", () => {
  const p = set1().promotion, old = baseline().find((r) => r.name === "old promotion");
  for (const t of ["deletion", "non_fast_forward"]) assert.ok(rule(p, t), t);
  const pr = rule(p, "pull_request").parameters;
  assert.equal(pr.require_code_owner_review, true);
  assert.deepEqual(pr.allowed_merge_methods.slice().sort(), ["rebase", "squash"]);
  assert.deepEqual(rule(p, "merge_queue").parameters, rule(old, "merge_queue").parameters);
});
