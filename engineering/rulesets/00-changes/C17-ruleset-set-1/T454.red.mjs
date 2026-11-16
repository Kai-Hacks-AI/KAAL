// Case engineering/T454 (engineering/C17): set 1 is exactly five rulesets in import shape, named beside the old ones, with no id
import { test } from "node:test";
import assert from "node:assert/strict";
import { NAMES, set1, listed } from "./helper.mjs";

test("engineering/T454 [engineering/C17]: set 1 is promotion, integration, hotfixing, wiring and publishing, in import shape, without the old prefix and without ids", () => {
  assert.deepEqual(listed(), NAMES.map((n) => `${n}.json`).sort());
  for (const [n, r] of Object.entries(set1())) {
    assert.equal(r.name, n);
    assert.ok(["branch", "tag"].includes(r.target), n);
    assert.equal(r.enforcement, "active", n);
    assert.ok(Array.isArray(r.conditions?.ref_name?.include) && r.conditions.ref_name.include.length > 0, n);
    assert.ok(Array.isArray(r.rules) && r.rules.length > 0, n);
    assert.ok(!/^old/i.test(r.name) && r.id === undefined, `${n}: no old prefix, no live id`);
  }
});
