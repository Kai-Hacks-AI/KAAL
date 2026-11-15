// Case engineering/T455 (engineering/C16): absent or unreadable evidence is unknown, exit 2, never a pass
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, base, HOTFIX_OK, WIRE_OK } from "./helper.mjs";

test("engineering/T455 [engineering/C16]: absent or unreadable evidence is unknown, exit 2, never a pass", async () => {
  const { admit } = await load();
  const { exitCode } = await load();
  for (const ev of [undefined, null, {}, { hotfix: null }, { hotfix: { chapters: "x" } }]) {
    const v = admit(facts("hotfix/fix-x", ev));
    assert.equal(v.kind, "unknown");
    assert.equal(exitCode(v), 2);
  }
  assert.equal(admit(facts("wire/w", { wire: null })).kind, "unknown");
  assert.deepEqual([["pass", 0], ["fail", 1], ["not-applicable", 3], ["unknown", 2]].map(([k, c]) => exitCode({ kind: k }) === c), [true, true, true, true]);
});
