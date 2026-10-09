import { test } from "node:test";
import assert from "node:assert/strict";
import * as capability from "kaal-github";

// Resolves "kaal-github" through its own package.json `exports`, so this runs
// against the built package surface, not against src.

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(capability), ["payload"]);
});

test("payload() carries one Node typed by Extension and its seal, and delivers no Agent Skill", () => {
  const delivered = capability.payload();
  assert.deepEqual(Object.keys(delivered), ["kaal"], "an Extension package carries a KAAL contribution and no Agent Skill");
  const nodes = Object.keys(delivered.kaal).filter((p) => !p.startsWith("seals/"));
  assert.deepEqual(nodes, ["GitHub.md"]);
  assert.equal(Object.keys(delivered.kaal).filter((p) => p.startsWith("seals/")).length, nodes.length);
  assert.match(delivered.kaal["GitHub.md"], /^---\nname: GitHub\ntype:\n {2}name: Extension\n {2}id: [0-9a-f]{64}\n---\n/);
});

test("payload() is deterministic", () => {
  assert.deepEqual(capability.payload(), capability.payload());
});
