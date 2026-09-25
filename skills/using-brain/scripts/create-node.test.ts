import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createNode } from "./create-node.js";

test("creates an immutable markdown node with YAML mechanics and markdown meaning", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));
  const file = createNode({
    root,
    lineage: "genesis",
    learning: "26/09/25/01",
    slug: "example",
    name: "example",
    meaning: "# Example\n\nMeaning.\n",
    edges: []
  });
  assert.match(fs.readFileSync(file, "utf8"), /^---\nname: example\n---\n\n# Example/);
  assert.throws(() => createNode({
    root, lineage: "genesis", learning: "26/09/25/01", slug: "example",
    name: "example", meaning: "changed", edges: []
  }), /already exists/);
});
