import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { nodeFiles, relativeIdentity, ROOT } from "../skills/using-brain/scripts/brain.js";
import { validate } from "../skills/using-brain/scripts/validate.js";
import { genesis } from "./genesis.js";

const GENESIS = "genesis/26/09/25/01";

// The committed Genesis learning is the expected result: this proves it is
// exactly what the birth path produces, not something placed by hand.
const learning = (root: string) =>
  Object.fromEntries(
    nodeFiles(path.join(root, GENESIS)).map((f) => [relativeIdentity(root, f), fs.readFileSync(f, "utf8")]),
  );

test("Genesis births exactly the committed Genesis learning through create-node", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "kaal-genesis-"));
  genesis(root);
  assert.deepEqual(learning(root), learning(ROOT));
  assert.deepEqual(validate(root), []);
});
