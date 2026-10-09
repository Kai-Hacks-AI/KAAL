import { test } from "node:test";
import assert from "node:assert/strict";
import * as capability from "kaal-engineering";

// Resolves "kaal-engineering" through its own package.json `exports`, so
// this runs against the built package surface, not against src.

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(capability), ["payload"]);
});

test("payload() carries one Node with its seal, and one Agent Skill", () => {
  const { kaal, skills } = capability.payload();
  assert.deepEqual(Object.keys(kaal).filter((p) => !p.startsWith("seals/")), ["Engineering-Skill.md"]);
  assert.equal(Object.keys(kaal).filter((p) => p.startsWith("seals/")).length, 1);
  assert.ok(skills["kaal-engineering/SKILL.md"]);
  assert.ok(Object.keys(skills).every((p) => p.startsWith("kaal-engineering/")), "exactly one skill");
});

test("payload() is deterministic", () => {
  assert.deepEqual(capability.payload(), capability.payload());
});
