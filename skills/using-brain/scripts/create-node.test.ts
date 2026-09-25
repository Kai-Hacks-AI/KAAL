import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createNode } from "./create-node.js";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));

test("creates an immutable markdown node with YAML mechanics and markdown meaning", () => {
  const root = tmp();
  const node = { root, lineage: "genesis", learning: "26/09/25/01", slug: "example", name: "example", edges: [] };
  const file = createNode({ ...node, meaning: "# Example\n\nMeaning.\n" });
  assert.match(fs.readFileSync(file, "utf8"), /^---\nname: example\n---\n\n# Example/);
  assert.throws(() => createNode({ ...node, meaning: "changed" }), /already exists/);
});

test("rejects traversal in lineage and slug", () => {
  const root = tmp();
  const base = { root, learning: "26/09/25/01", name: "x", meaning: "x" };
  assert.throws(() => createNode({ ...base, lineage: "../outside", slug: "x" }), /lineage/);
  assert.throws(() => createNode({ ...base, lineage: "genesis", slug: "../outside" }), /slug/);
});

test("rejects an empty name", () => {
  const root = tmp();
  assert.throws(
    () => createNode({ root, lineage: "genesis", learning: "26/09/25/01", slug: "x", name: " ", meaning: "x" }),
    /name is required/,
  );
});

test("writes edges whose relation and target were born earlier", () => {
  const root = tmp();
  const base = { root, lineage: "genesis", meaning: "x" };
  createNode({ ...base, learning: "26/09/25/01", slug: "r", name: "r" });
  createNode({ ...base, learning: "26/09/25/01", slug: "b", name: "B" });
  const edge = { relation: "genesis/26/09/25/01/nodes/r.md", to: "genesis/26/09/25/01/nodes/b.md" };
  const file = createNode({ ...base, learning: "26/09/25/02", slug: "a", name: "A", edges: [edge] });
  assert.match(fs.readFileSync(file, "utf8"), /relation: genesis\/26\/09\/25\/01\/nodes\/r\.md/);
});

test("refuses birth when an edge's relation or target is missing or not born earlier", () => {
  const root = tmp();
  const base = { root, lineage: "genesis", learning: "26/09/25/01", meaning: "x" };
  createNode({ ...base, slug: "r", name: "r" });
  const edge = { relation: "genesis/26/09/25/01/nodes/r.md", to: "genesis/26/09/25/01/nodes/missing.md" };
  assert.throws(
    () => createNode({ ...base, slug: "a", name: "A", edges: [edge] }),
    (e: Error) => /missing target/.test(e.message) && /relation .* was not born earlier/.test(e.message),
  );
  assert.equal(fs.existsSync(path.join(root, "genesis/26/09/25/01/nodes/a.md")), false);
});
