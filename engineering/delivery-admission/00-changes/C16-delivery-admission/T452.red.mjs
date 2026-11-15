// Case engineering/T452 (engineering/C16): a wire head passes only when the WIRE judge accepts the install
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, base, HOTFIX_OK, WIRE_OK } from "./helper.mjs";

test("engineering/T452 [engineering/C16]: a wire head passes only when the WIRE judge accepts the install", async () => {
  const { admit } = await load();
  assert.equal(admit(facts("wire/githooks-split", WIRE_OK)).kind, "pass");
  const bad = { wire: { ...WIRE_OK.wire, changed: [...WIRE_OK.wire.changed, { path: "README.md", text: "z" }] } };
  assert.equal(admit(facts("wire/githooks-split", bad)).kind, "fail");
  const drift = { wire: { ...WIRE_OK.wire, changed: [{ path: ".github/x.yml", text: "b" }] } };
  assert.equal(admit(facts("wire/githooks-split", drift)).kind, "fail");
});
