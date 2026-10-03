import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as embedding from "../src/embed/index.js";
import { KERNEL_PATH, kernelMarkdown, payload } from "../src/embed/kernel.js";
import { kernelSeal } from "../src/engineering/seal.js";
import { verifyKernel } from "../src/engineering/verify.js";

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(embedding), ["payload"]);
  assert.equal(embedding.payload, payload);
});

test("payload is exactly core/KERNEL.md, as produced by kernelMarkdown()", () => {
  assert.deepEqual(payload(), { "core/KERNEL.md": kernelMarkdown() });
  assert.equal(KERNEL_PATH, "core/KERNEL.md");
});

test("the generated Kernel satisfies the bootstrap contract", () => {
  assert.deepEqual(verifyKernel(kernelMarkdown()), []);
});

test("the contract rejects a Kernel that has been altered", () => {
  const k = kernelMarkdown();
  const altered = {
    "no edge semantics": k.replace("## Edge", "## Link"),
    "occurrence defines itself": k.replace("does not define its own meaning", "defines its own meaning"),
    "mutable": k.replace("never changes", "may change"),
    "no self-reference": k.replaceAll("`core/KERNEL.md`", "this file"),
    "denies being a Node": k.replace("This file is a Node.", "This file is not a Node."),
    "frontmatter added": "---\nedges: []\n---\n" + k,
    "no trailing newline": k.trimEnd(),
  };
  for (const [why, md] of Object.entries(altered)) {
    assert.notDeepEqual(verifyKernel(md), [], why);
  }
});

test("the generated Kernel matches its seal", () => {
  const seal = readFileSync(new URL("../../kernel.sha256", import.meta.url), "utf8").trim();
  assert.equal(kernelSeal(), seal, "Kernel changed. If intended, run seal-kaal-kernel.");
});
