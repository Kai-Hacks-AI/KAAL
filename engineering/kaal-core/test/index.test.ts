import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as embedding from "kaal-core";
import { KERNEL_PATH, kernelMarkdown } from "../src/kernel.js";
import { kernelSeal } from "../src/seal.js";
import { verifyKernel } from "../src/verify.js";

test("the public API is exactly payload()", () => {
  assert.deepEqual(Object.keys(embedding), ["payload"]);
});

test("payload is exactly core/KERNEL.md", () => {
  assert.deepEqual(Object.keys(embedding.payload()), [KERNEL_PATH]);
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
    "freezes the default directory name": k.replace("KAAL directory, the directory that holds `core/`", ".kaal directory"),
    "chapters out of order": k.replace("## Form", "## Edge2").replace("## Edge\n", "## Form\n").replace("## Edge2", "## Edge"),
    "Kernel title renamed": k.replace("# Kernel\n", "# Core\n"),
    "extra H3 chapter": k.replace("## Form\n", "### Detail\n\n## Form\n"),
    "extra H1 chapter": k + "\n# Appendix\n",
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
