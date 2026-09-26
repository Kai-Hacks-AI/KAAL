import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { ANCHOR_AGENTS_MD, ANCHOR_DIR, createAnchor } from "../skills/testing/scripts/create-anchor.js";
import { entries, tree } from "./test-data.js";

// KAAL's testing has one anchor, test/, whose entry point is created by the
// testing skill and never placed by hand. Besides it, test/ holds only KAAL's
// Regression Plan; tests and their data stay where they are.
const REPO = fileURLToPath(new URL("../", import.meta.url));

// Why: scripts/test-anchor.test.ts
test("KAAL's test/ holds exactly the entry point the testing skill creates and KAAL's Regression Plan", () => {
  const created = createAnchor(path.join(fs.mkdtempSync(path.join(os.tmpdir(), "kaal-anchor-")), ANCHOR_DIR));
  const committed = path.join(REPO, ANCHOR_DIR);
  assert.deepEqual(entries(committed), [...entries(created), "regression-plan.md (file)"].sort());
  assert.equal(tree(committed)["AGENTS.md"], tree(created)["AGENTS.md"]);
});

/** Every AGENTS.md in the repository, by posix path, outside dependencies and Git's own files. */
function agentsFiles(dir = REPO): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const file = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" || e.name === ".git" ? [] : agentsFiles(file);
    return e.isFile() && e.name === "AGENTS.md" ? [path.relative(REPO, file).split(path.sep).join("/")] : [];
  });
}

// Why: scripts/test-anchor.test.ts
test("test/ is KAAL's only testing anchor: no other directory holds the entry point the testing skill creates", () => {
  const anchors = agentsFiles().filter((file) => fs.readFileSync(path.join(REPO, file), "utf8") === ANCHOR_AGENTS_MD);
  assert.deepEqual(anchors, [`${ANCHOR_DIR}/AGENTS.md`]);
});
