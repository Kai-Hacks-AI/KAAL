// Case engineering/T450 (engineering/C16): main admits the three delivery stocks and nothing else; forks and other bases are judged first
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, base, green } from "./helper.mjs";

test("engineering/T450 [engineering/C16]: main admits kaal/<capability>/*, hotfix/* and wire/* of this repository, and no other branch", async () => {
  const { promotionSource } = await load();
  const ok = green("Guard", "Hosting (Linux)");
  assert.equal(promotionSource({ ...base, headRef: "hotfix/x", checks: ok }).kind, "pass");
  assert.equal(promotionSource({ ...base, headRef: "wire/githooks-split", checks: ok }).kind, "pass");
  assert.equal(promotionSource({ ...base, headRef: "kaal/release/pull-lane" }).kind, "pass");
  assert.equal(promotionSource({ ...base, headRef: "claude/z", checks: ok }).kind, "fail", "every other branch is development stock, not deliverable");
  assert.equal(promotionSource({ ...base, headRef: "hotfix/x", headRepo: "fork/r", checks: ok }).kind, "fail", "a fork is never admitted");
  assert.equal(promotionSource({ ...base, baseRef: "kaal/y", headRef: "wire/x", checks: ok }).kind, "not-applicable");
});
