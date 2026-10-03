import { test } from "node:test";
import assert from "node:assert/strict";
import * as embedding from "kaal-core";
import { KERNEL_PATH, kernelMarkdown } from "../src/kernel.js";
import { nodePaths, sealNode, sealPath } from "../src/seal.js";
import { verifyKernel } from "../src/verify.js";

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(embedding), ["payload"]);
});

test("payload is Node 1 and its detached seal", () => {
  assert.equal(KERNEL_PATH, "core/KERNEL.md");
  assert.deepEqual(Object.keys(embedding.payload()), [KERNEL_PATH, "seals/core/KERNEL.md.sha256"]);
  assert.deepEqual(nodePaths(embedding.payload()), [KERNEL_PATH]);
  assert.equal(sealPath(KERNEL_PATH), "seals/core/KERNEL.md.sha256");
});

test("the generated Kernel satisfies the bootstrap contract", () => {
  assert.deepEqual(verifyKernel(kernelMarkdown()), []);
});

test("the contract rejects a Kernel that breaks a KAAL invariant", () => {
  const k = kernelMarkdown();
  const altered = {
    "denies being a Node": k.replace("This file is a Node.", "This file is not a Node."),
    "a Node may change": k.replace("never changes", "may change"),
    "occurrence defines itself": k.replace("does not define its own meaning", "defines its own meaning"),
    "freezes the default directory name": k.replace("KAAL directory, the directory that holds `core/`", ".kaal directory"),
    "declares Edge occurrences itself": "---\nedges: []\n---\n" + k,
  };
  for (const [why, md] of Object.entries(altered)) {
    assert.notDeepEqual(verifyKernel(md), [], why);
  }
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
