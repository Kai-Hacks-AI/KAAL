// Case engineering/T454 (engineering/C16): destination IN: a fork fails, a base other than the default is not applicable, and a passing record overrides neither
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okOut, entry, REGISTRATION, HEAD } from "./helper.mjs";

test("engineering/T454 [engineering/C16]: destination IN: a fork fails, a base other than the default is not applicable, and a passing record overrides neither", async () => {
  const { admit } = await load();
  assert.equal(admit(facts("hotfix/x", "hotfix", { headRepo: "fork/r" })).kind, "fail");
  assert.equal(admit(facts("hotfix/x", "hotfix", { baseRef: "kaal/foundation/0.0.2" })).kind, "not-applicable");
});
