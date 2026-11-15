// Case engineering/T452 (engineering/C16): OUT is consumed, never recomputed: absent or stale is unknown, another qualifier or a failing verdict fails, a head-bound pass passes
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okOut, entry, REGISTRATION, HEAD } from "./helper.mjs";

test("engineering/T452 [engineering/C16]: OUT is consumed, never recomputed: absent or stale is unknown, another qualifier or a failing verdict fails, a head-bound pass passes", async () => {
  const { admit } = await load();
  assert.equal(admit(facts("hotfix/x", undefined)).kind, "unknown");
  assert.equal(admit(facts("hotfix/x", "hotfix", { out: okOut("hotfix", "hotfix-out", "b".repeat(40)) })).kind, "unknown", "evidence for another sha");
  assert.equal(admit(facts("hotfix/x", "hotfix", { out: okOut("hotfix", "some-other-qualifier") })).kind, "fail");
  assert.equal(admit(facts("hotfix/x", "hotfix", { out: { ...okOut("hotfix"), verdict: "fail" } })).kind, "fail");
  assert.equal(admit(facts("hotfix/x", "hotfix", { out: { ...okOut("hotfix"), verdict: "unknown" } })).kind, "unknown");
  assert.equal(admit(facts("hotfix/x", "hotfix")).kind, "pass");
});
