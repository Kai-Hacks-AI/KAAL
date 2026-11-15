// Case engineering/T453 (engineering/C16): heads that belong to no class, or are malformed, or come from a fork, fail closed
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, base, HOTFIX_OK, WIRE_OK } from "./helper.mjs";

test("engineering/T453 [engineering/C16]: heads that belong to no class, or are malformed, or come from a fork, fail closed", async () => {
  const { admit } = await load();
  for (const ref of ["feature/x", "hotfix/", "hotfix/a/b", "wire/", "HOTFIX/x", "Wire/x", "main", "kaal", "refs/heads/kaal/x"]) {
    assert.equal(admit(facts(ref, { ...HOTFIX_OK, ...WIRE_OK })).kind, "fail", ref);
  }
  assert.equal(admit({ ...facts("hotfix/fix-x", HOTFIX_OK), headRepo: "fork/r" }).kind, "fail");
  assert.equal(admit({ ...facts("kaal/x", undefined), headRepo: "fork/r" }).kind, "fail");
});
