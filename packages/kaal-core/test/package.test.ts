import { test } from "node:test";
import assert from "node:assert/strict";
import * as core from "kaal-core";

// Resolves "kaal-core" through its own package.json `exports`, so this runs
// against the built package surface, not against src.

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(core), ["payload"]);
});

test("payload() returns the Kernel, the foundation Nodes and their seal markers", () => {
  const files = core.payload();
  for (const path of ["core/KERNEL.md", "core/Node.md", "core/Edge.md", "core/KAAL-Definition.md", "core/CASE.md", "core/Core.md"]) {
    assert.equal(typeof files[path], "string", path);
    assert.notEqual(files[path], "", path);
  }
  const markers = Object.keys(files).filter((p) => p.startsWith("seals/"));
  assert.equal(markers.length, 5);
  for (const path of markers) assert.equal(files[path], "", path);
});

test("payload() is deterministic", () => {
  assert.deepEqual(core.payload(), core.payload());
});
