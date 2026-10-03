import { test } from "node:test";
import assert from "node:assert/strict";
import * as embedding from "kaal-core";
import { checkBootstrap } from "../helpers/bootstrap.js";

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(embedding), ["payload"]);
});

test("the recorded seals match the Kernel and the Nodes", () => {
  assert.deepEqual(checkBootstrap(), [], "Content changed. If intended, run npm run seal-kaal-bootstrap.");
});

test("changing the Kernel, or a sealed Node by a single byte, is detected", () => {
  const files = embedding.payload();
  for (const path of ["core/KERNEL.md", "core/Node.md", "core/Edge.md"]) {
    assert.notEqual(checkBootstrap({ ...files, [path]: files[path] + " " }).length, 0, path);
  }
});
