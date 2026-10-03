import { test } from "node:test";
import assert from "node:assert/strict";
import * as embedding from "kaal-core";
import { KERNEL_PATH } from "../src/kernel.js";
import { nodePaths, sealNode, sealPath } from "../src/seal.js";

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(embedding), ["payload"]);
});

test("payload is Node 1 and its detached seal", () => {
  assert.equal(KERNEL_PATH, "core/KERNEL.md");
  assert.deepEqual(Object.keys(embedding.payload()), [KERNEL_PATH, "seals/core/KERNEL.md.sha256"]);
  assert.deepEqual(nodePaths(embedding.payload()), [KERNEL_PATH]);
  assert.equal(sealPath(KERNEL_PATH), "seals/core/KERNEL.md.sha256");
});

test("every Node's deployed seal is the seal of its bytes", () => {
  const files = embedding.payload();
  for (const path of nodePaths(files)) {
    assert.equal(
      files[sealPath(path)],
      sealNode(files[path]) + "\n",
      `${path} changed. If intended, run seal-kaal-kernel.`,
    );
  }
});
