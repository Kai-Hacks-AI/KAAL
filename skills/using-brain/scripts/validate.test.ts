import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createNode } from "./create-node.js";
import { validate } from "./validate.js";

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));

// Writes a node without create-node's birth checks, to simulate a hand-edited BRAIN.
function writeRaw(root: string, id: string, content: string): void {
  const file = path.join(root, id);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

test("accepts references to relation and target born in earlier learnings", () => {
  const root = tmp();
  createNode({ root, lineage: "genesis", learning: "26/09/25/01", slug: "relation", name: "relation", meaning: "relation" });
  createNode({ root, lineage: "genesis", learning: "26/09/25/01", slug: "b", name: "B", meaning: "B" });
  createNode({ root, lineage: "genesis", learning: "26/09/25/02", slug: "a", name: "A", meaning: "A", edges: [
    { relation: "genesis/26/09/25/01/nodes/relation.md", to: "genesis/26/09/25/01/nodes/b.md" },
  ] });
  assert.deepEqual(validate(root), []);
});

test("rejects missing and same-or-later knowledge", () => {
  const root = tmp();
  createNode({ root, lineage: "genesis", learning: "26/09/25/01", slug: "relation", name: "relation", meaning: "relation" });
  writeRaw(root, "genesis/26/09/25/01/nodes/a.md",
    "---\nname: A\nedges:\n  - relation: genesis/26/09/25/01/nodes/relation.md\n    to: genesis/26/09/25/01/nodes/missing.md\n---\n");
  assert.deepEqual(validate(root), [
    "genesis/26/09/25/01/nodes/a.md: relation genesis/26/09/25/01/nodes/relation.md was not born earlier",
    "genesis/26/09/25/01/nodes/a.md: missing target genesis/26/09/25/01/nodes/missing.md",
  ]);
});

test("reports malformed frontmatter as file-prefixed errors instead of crashing", () => {
  const root = tmp();
  writeRaw(root, "genesis/26/09/25/01/nodes/null-edge.md", "---\nname: A\nedges:\n  - null\n---\n");
  writeRaw(root, "genesis/26/09/25/01/nodes/empty.md", "---\n\n---\n");
  const errors = validate(root);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /empty\.md: frontmatter must be a mapping/);
  assert.match(errors[1], /null-edge\.md: each edge needs string relation and to/);
});
