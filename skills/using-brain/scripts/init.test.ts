import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { init } from "./init.js";
import { validate } from "./validate.js";

test("Genesis creates the first BRAIN through create-node mechanics", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));
  init(root);
  assert.ok(fs.existsSync(path.join(root, "genesis/26/09/25/01/nodes/using-brain.md")));
  assert.deepEqual(validate(root), []);
});
