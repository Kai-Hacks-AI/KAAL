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

test("sealNode hashes exact bytes", () => {
  assert.equal(sealNode(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.notEqual(sealNode("a\n"), sealNode("a\r\n"));
  assert.equal(sealNode("é"), sealNode(new TextEncoder().encode("é")));
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
    "heading hidden in a code fence": k.replace("## Node\n", "```\n## Node\n```\n"),
    "heading hidden in an indented tilde fence": k.replace("## Node\n", "  ~~~\n## Node\n  ~~~\n"),
    "denies being a Node": k.replace("This file is a Node.", "This file is not a Node."),
    "frontmatter added": "---\nedges: []\n---\n" + k,
    "no trailing newline": k.trimEnd(),
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
