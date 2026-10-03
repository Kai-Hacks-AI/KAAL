// The bootstrap, K-N-I-F-E, proven from what is deployed. The Kernel is
// genesis: its chapters are the bootstrap's steps, and it is not a Node. Form
// declares a Node, SHA-256 of its bytes is its ID, and a seal records that
// this exact Node was sealed: three separate claims. Each Node's own Markdown
// is where its suite comes from.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readNodes, resolve } from "../helpers/nodes.js";
import { checkBytes } from "../helpers/seal.js";
import { deploy } from "./setup.js";

const GENESIS_SEAL = new URL("../../kernel.sha256", import.meta.url);

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

/** Deploy, then hand over what the suites assert on. */
function deployed(t: { after: (fn: () => void) => void }) {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  return {
    kernel: readFileSync(join(dir, "core", "KERNEL.md"), "utf8"),
    nodes,
    sealed: readdirSync(join(dir, "seals")),
    node: nodes.find((n) => n.name === "Node"),
    edge: nodes.find((n) => n.name === "Edge"),
  };
}

test("K: the Kernel is genesis, sealed apart from the Nodes, and not a Node; its chapters order the bootstrap", (t) => {
  const { kernel, nodes } = deployed(t);
  assert.equal(checkBytes(kernel, readFileSync(GENESIS_SEAL, "utf8").trim(), "Kernel"), undefined);
  assert.deepEqual(kernel.match(/^#{1,6} .+$/gm), ["# Kernel", "## Node", "## Immutability", "## Form", "## Edge"]);
  assert.match(kernel, /It is not a Node\./);
  assert.ok(!kernel.includes(".kaal"), "names no directory");
  assert.ok(!nodes.some((n) => n.markdown === kernel), "declares no Form, so is no Node");
});

test("N, I: Node 1 `Node` is the genesis exception, and is sealed", (t) => {
  const { node, sealed } = deployed(t);
  assert.ok(node, "Node 1 is deployed");
  assert.equal(node.type, undefined, "declares no type");
  assert.ok(sealed.includes(node.id), "its ID is recorded as sealed");
});

test("F, E: Edge is handcrafted through Form, typed by Node 1 by name and ID, and sealed", (t) => {
  const { node, edge, nodes, sealed } = deployed(t);
  assert.ok(node && edge, "both Nodes are deployed");
  assert.deepEqual(edge.type, { name: "Node", id: node.id });
  assert.equal(resolve(nodes, edge.type), node, "the reference resolves to Node 1");
  assert.throws(() => resolve(nodes, { name: "Wrong", id: node.id }), /is named Node, not Wrong/);
  assert.ok(sealed.includes(edge.id), "its ID is recorded as sealed");
  assert.equal(nodes.length, sealed.length, "every admitted Node is sealed, and nothing else");
});

test("Form: no Node contains its own ID or a location, and its own text carries its suite", async (t) => {
  for (const node of deployed(t).nodes) {
    await t.test(node.name, () => {
      assert.ok(!node.markdown.includes(node.id), "does not contain its own ID");
      assert.doesNotMatch(node.markdown, /\.md\b|\.kaal|core\//, "mentions no location");
      suites[node.name]?.(node.markdown);
    });
  }
});
