import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { nodeFiles, relativeIdentity } from "./brain.js";
import { init } from "./init.js";
import { brainData, scratchBrain } from "./test-data.js";
import { validate } from "./validate.js";

test("Genesis creates the first BRAIN through create-node mechanics", () => {
  const root = scratchBrain();
  init(root);
  const want = brainData("genesis");
  const ids = (r: string) => nodeFiles(r).map((f) => relativeIdentity(r, f));
  assert.deepEqual(ids(root), ids(want));
  for (const id of ids(want)) {
    assert.equal(fs.readFileSync(path.join(root, id), "utf8"), fs.readFileSync(path.join(want, id), "utf8"));
  }
  assert.deepEqual(validate(root), []);
});
