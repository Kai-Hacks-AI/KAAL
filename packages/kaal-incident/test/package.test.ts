import { test } from "node:test";
import assert from "node:assert/strict";
import * as capability from "kaal-incident";

// Resolves "kaal-incident" through its own package.json `exports`, so this
// runs against the built package surface, not against src.

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(capability), ["payload"]);
});

test("payload() carries its Nodes, each with its seal, and one Agent Skill", () => {
  const { kaal, skills } = capability.payload();
  const nodes = Object.keys(kaal).filter((p) => !p.startsWith("seals/"));
  assert.deepEqual(nodes, ["KAAL-Incident.md"]);
  assert.equal(Object.keys(kaal).filter((p) => p.startsWith("seals/")).length, nodes.length);
  assert.ok(skills["kaal-incident/SKILL.md"]);
  assert.ok(Object.keys(skills).every((p) => p.startsWith("kaal-incident/")), "exactly one skill");
});

test("payload() is deterministic", () => {
  assert.deepEqual(capability.payload(), capability.payload());
});
