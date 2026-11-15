// Case engineering/T450 (engineering/C16): a head resolves to the one stock whose accepted route claims it; the name decides routing only
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okOut, entry, REGISTRATION, HEAD } from "./helper.mjs";

test("engineering/T450 [engineering/C16]: a head resolves to the one stock whose accepted route claims it; the name decides routing only", async () => {
  const { admit } = await load();
  assert.equal(admit(facts("hotfix/fix-x", "hotfix")).stock, "hotfix");
  assert.equal(admit(facts("wire/githooks", "wire")).stock, "wire");
  const dev = admit(facts("kaal/hotfix/qualifier", "hotfix-capability"));
  assert.equal(dev.stock, "hotfix-capability");
  assert.notEqual(dev.stock, "hotfix");
  assert.equal(admit(facts("kaal/foundation/0.0.2", "kaal-foundation")).kind, "pass");
  assert.equal(admit(facts("hotfix/fix-x", "wire")).kind, "fail", "evidence of another stock does not admit a hotfix route");
});
