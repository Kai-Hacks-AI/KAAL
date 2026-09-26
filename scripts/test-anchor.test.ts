import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { ANCHOR_DIR, createAnchor } from "../skills/testing/scripts/create-anchor.js";
import { entries, tree } from "./test-data.js";

// KAAL's testing has one anchor, test/, created by the testing skill and never
// placed by hand. Tests and their data stay where they are; test/ only routes.
const REPO = fileURLToPath(new URL("../", import.meta.url));

test("KAAL's test/ is exactly the anchor the testing skill creates, nothing added", () => {
  const created = createAnchor(path.join(fs.mkdtempSync(path.join(os.tmpdir(), "kaal-anchor-")), ANCHOR_DIR));
  const committed = path.join(REPO, ANCHOR_DIR);
  assert.deepEqual(entries(committed), entries(created));
  assert.deepEqual(tree(committed), tree(created));
});
