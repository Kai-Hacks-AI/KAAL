// Case engineering/T456 (engineering/C16): a pull request whose base is not the default branch is not applicable
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, base, HOTFIX_OK, WIRE_OK } from "./helper.mjs";

test("engineering/T456 [engineering/C16]: a pull request whose base is not the default branch is not applicable", async () => {
  const { admit } = await load();
  const v = admit({ ...facts("feature/x", undefined), baseRef: "kaal/foundation/0.0.2" });
  assert.equal(v.kind, "not-applicable");
});
