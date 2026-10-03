// The bootstrap, K-N-I-F-E, proven from what is deployed. The Kernel is
// genesis: its chapters are the bootstrap's steps, and it is not a Node. The
// Nodes it births are sealed; each Node's own Markdown is where its suite
// comes from. Nothing in src/ restates any of this.
import { test } from "node:test";
import assert from "node:assert/strict";
import { deploy } from "./setup.js";

const suites: Record<string, (markdown: string) => void> = {
  Node(md) {
    assert.ok(md.includes("unit of meaning"), "says what a Node is");
    assert.ok(md.includes("only by ID"), "points to other Nodes by ID");
    assert.ok(md.includes("never changes"), "a sealed Node never changes");
    assert.ok(md.includes("SHA-256 of its exact bytes"), "its ID is the SHA-256 of its exact bytes");
  },
  Edge(md) {
    assert.ok(md.includes("pointer from one Node to others"), "says what an Edge is");
    assert.ok(md.includes("already sealed") && md.includes("immutable ID"), "points to sealed Nodes by immutable ID");
    assert.ok(md.includes("never by where they are stored"), "never by location");
  },
};

test("K: the Kernel is genesis and not a Node, and orders the bootstrap", async (t) => {
  const deployed = await deploy();
  t.after(deployed.cleanup);
  assert.deepEqual(
    deployed.chapters.map((c) => [c.level, c.title]),
    [[1, "Kernel"], [2, "Node"], [2, "Immutability"], [2, "Form"], [2, "Edge"]],
  );
  assert.match(deployed.chapters[0].markdown, /It is not a Node\./);
  assert.ok(!deployed.chapters.some((c) => c.markdown.includes(".kaal")), "names no directory");
});

test("N, I, E: Node 1 `Node` and Node 2 `Edge` are born, sealed, and distinct", async (t) => {
  const deployed = await deploy();
  t.after(deployed.cleanup);
  assert.deepEqual(deployed.nodes.map((n) => n.name).sort(), ["Edge", "Node"]);
  assert.equal(new Set(deployed.nodes.map((n) => n.id)).size, 2);
});

test("F: every Node satisfies Form, and its own chapters carry its suite", async (t) => {
  const deployed = await deploy();
  t.after(deployed.cleanup);
  for (const node of deployed.nodes) {
    await t.test(node.name, () => {
      assert.equal(node.chapters[0].level, 1, "starts with a level-1 heading naming it");
      assert.doesNotMatch(node.markdown, /\.md\b|\.kaal|core\/|[0-9a-f]{64}/, "mentions neither its location nor an ID");
      suites[node.name](node.markdown);
    });
  }
});
