// Case engineering/T451 (engineering/C16): no entry, ambiguous entries, or an absent, unreadable or head-only registration fail closed
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okOut, entry, REGISTRATION, HEAD } from "./helper.mjs";

test("engineering/T451 [engineering/C16]: no entry, ambiguous entries, or an absent, unreadable or head-only registration fail closed", async () => {
  const { admit } = await load();
  assert.equal(admit(facts("feature/x", "hotfix")).kind, "fail", "no entry claims it");
  const twice = { accepted: true, entries: [...REGISTRATION.entries, entry("other", "hotfix/*")] };
  assert.equal(admit(facts("hotfix/x", "hotfix", { registration: twice })).kind, "fail", "two stocks claim one route");
  for (const registration of [null, undefined, { accepted: false, entries: REGISTRATION.entries }, { accepted: true, entries: "x" }]) {
    assert.equal(admit(facts("hotfix/x", "hotfix", { registration })).kind, "unknown");
  }
  assert.equal(admit(facts("hotfix/x", "hotfix", { registration: { ...REGISTRATION, source: "head" } })).kind, "unknown", "a registration read from the head does not count");
});
