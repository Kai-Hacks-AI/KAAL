// The bootstrap, K-N-I-F-E, proven from what is deployed. The Kernel is
// genesis: its chapters are the bootstrap's steps, and it is not a Node. Form
// declares a Node, SHA-256 of its bytes is its ID, and a seal records that
// this exact Node was sealed: three separate claims. Each Node's own Markdown
// is where its suite comes from. Nothing in src/ restates any of this.
import { test } from "node:test";
import assert from "node:assert/strict";
import { deploy } from "./setup.js";

const suites: Record<string, (markdown: string) => void> = {
  Node(md) {
    assert.ok(md.includes("unit of meaning"), "says what a Node is");
    assert.ok(md.includes("only by name and immutable ID"), "refers to other Nodes by name and ID");
    assert.ok(md.includes("genesis exception"), "names the genesis exception");
    assert.ok(md.includes("never changes"), "a sealed Node never changes");
    assert.ok(md.includes("SHA-256 of its exact bytes"), "its ID is the SHA-256 of its exact bytes");
  },
  Edge(md) {
    assert.ok(md.includes("pointer from one Node to others"), "says what an Edge is");
    assert.ok(md.includes("already sealed"), "points only to sealed Nodes");
    assert.ok(md.includes("name and its immutable ID"), "refers to Nodes by name and immutable ID");
    assert.ok(md.includes("never refers to where a Node is stored"), "never by location");
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
  assert.ok(!deployed.nodes.some((n) => n.path.endsWith("KERNEL.md")), "declares no Form, so is no Node");
});

test("N, I: Node 1 `Node` is the genesis exception, and is sealed", async (t) => {
  const deployed = await deploy();
  t.after(deployed.cleanup);
  const node = deployed.nodes.find((n) => n.name === "Node");
  assert.ok(node, "Node 1 is deployed");
  assert.equal(node.type, undefined, "declares no type");
  assert.ok(deployed.sealed.includes(node.id), "its ID is recorded as sealed");
});

test("F, E: Edge is handcrafted through Form, typed by Node 1 by name and ID, and sealed", async (t) => {
  const deployed = await deploy();
  t.after(deployed.cleanup);
  const node = deployed.nodes.find((n) => n.name === "Node");
  const edge = deployed.nodes.find((n) => n.name === "Edge");
  assert.ok(node && edge, "both Nodes are deployed");
  assert.deepEqual(edge.type, { name: "Node", id: node.id });
  assert.equal(deployed.helpers.resolve(deployed.nodes, edge.type), node, "the reference resolves to Node 1");
  assert.throws(() => deployed.helpers.resolve(deployed.nodes, { name: "Wrong", id: node.id }), /is named Node, not Wrong/);
  assert.ok(deployed.sealed.includes(edge.id), "its ID is recorded as sealed");
  assert.equal(deployed.nodes.length, 2, "the bootstrap yields exactly two Nodes");
  assert.deepEqual([...deployed.sealed].sort(), [node.id, edge.id].sort(), "and exactly those are sealed");
});

test("Form: no Node contains its own ID or a location, and its own text carries its suite", async (t) => {
  const deployed = await deploy();
  t.after(deployed.cleanup);
  for (const node of deployed.nodes) {
    await t.test(node.name, () => {
      assert.ok(!node.markdown.includes(node.id), "does not contain its own ID");
      assert.doesNotMatch(node.markdown, /\.md\b|\.kaal|core\//, "mentions no location");
      suites[node.name](node.markdown);
    });
  }
});
