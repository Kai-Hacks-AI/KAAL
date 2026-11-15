// Case engineering/T450 (engineering/C16): a head resolves to the one stock whose accepted route claims it; the name decides routing only
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okOut, REGISTRY, HEAD } from "./helper.mjs";

test("engineering/T450 [engineering/C16]: a head resolves to the one stock whose accepted route claims it; the name decides routing only", async () => {
  const { admit } = await load();
  assert.equal(admit(facts("hotfix/fix-x", "HOTFIX")).stock, "HOTFIX");
  assert.equal(admit(facts("wire/githooks", "WIRE")).stock, "WIRE");
  const dev = admit(facts("kaal/hotfix/qualifier", "KAAL"));
  assert.equal(dev.stock, "KAAL", "kaal/hotfix/* develops the Hotfix capability: a KAAL stock");
  assert.notEqual(dev.stock, "HOTFIX");
  assert.equal(admit(facts("kaal/foundation/0.0.2", "KAAL")).kind, "pass");
  assert.equal(admit(facts("hotfix/fix-x", "WIRE")).kind, "fail", "evidence of another stock does not admit a hotfix route");
});
