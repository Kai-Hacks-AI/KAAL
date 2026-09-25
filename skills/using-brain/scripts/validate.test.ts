import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createNode } from "./create-node.js";
import { validate } from "./validate.js";

test("accepts references to relation and target born in earlier learnings", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));
  createNode({ root, lineage:"genesis", learning:"26/09/25/01", slug:"relation", name:"relation", meaning:"relation", edges:[] });
  createNode({ root, lineage:"genesis", learning:"26/09/25/01", slug:"b", name:"B", meaning:"B", edges:[] });
  createNode({ root, lineage:"genesis", learning:"26/09/25/02", slug:"a", name:"A", meaning:"A", edges:[
    { relation:"genesis/26/09/25/01/nodes/relation.md", to:"genesis/26/09/25/01/nodes/b.md" }
  ]});
  assert.deepEqual(validate(root), []);
});

test("rejects missing and same-or-later knowledge", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));
  createNode({ root, lineage:"genesis", learning:"26/09/25/01", slug:"relation", name:"relation", meaning:"relation", edges:[] });
  createNode({ root, lineage:"genesis", learning:"26/09/25/01", slug:"a", name:"A", meaning:"A", edges:[
    { relation:"genesis/26/09/25/01/nodes/relation.md", to:"genesis/26/09/25/01/nodes/missing.md" }
  ]});
  assert.equal(validate(root).length, 2);
});
