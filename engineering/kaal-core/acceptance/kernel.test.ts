// Node 1 births its suite. The deployed, sealed KERNEL.md exposes its chapters
// (KNIFE); each chapter is one suite boundary, and the assertions below are
// what the Kernel says there. Nothing in src/ restates this.
import { test } from "node:test";
import assert from "node:assert/strict";
import { deployKernel } from "./setup.js";

const suites: Record<string, (markdown: string) => void> = {
  Kernel(md) {
    assert.ok(md.includes("This file is a Node."), "declares that it is itself a Node");
    assert.ok(!md.includes("is not a Node"), "does not deny being a Node");
    assert.ok(md.includes("`core/KERNEL.md`"), "names itself by its own path");
  },
  Node(md) {
    assert.ok(md.includes("unit of meaning"), "says what a Node is");
  },
  Immutability(md) {
    assert.ok(md.includes("never changes"), "a Node never changes");
  },
  Form(md) {
    assert.ok(md.includes("`edges`") && md.includes("frontmatter"), "says where Edge occurrences are declared");
    assert.ok(md.includes("`edge`") && md.includes("`to`"), "says how an occurrence names its defining Node and targets");
    assert.ok(md.includes("relative to the KAAL directory"), "says how Nodes are referred to");
  },
  Edge(md) {
    assert.ok(md.includes("defines what the Edge means") && md.includes("points to"), "distinguishes the defining Node from the targets");
    assert.ok(md.includes("does not define its own meaning"), "an occurrence does not define its own meaning");
  },
};

test("the deployed Kernel's chapters are the suites that test it", async (t) => {
  const deployed = await deployKernel();
  t.after(deployed.cleanup);
  assert.deepEqual(
    deployed.chapters.map((c) => [c.level, c.title]),
    [[1, "Kernel"], [2, "Node"], [2, "Immutability"], [2, "Form"], [2, "Edge"]],
  );
  for (const chapter of deployed.chapters) {
    await t.test(chapter.title, () => {
      assert.ok(!chapter.markdown.includes(".kaal"), "freezes no directory name into the semantics");
      suites[chapter.title](chapter.markdown);
    });
  }
});
