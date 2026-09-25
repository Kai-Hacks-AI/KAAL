import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { init } from "./init.js";

// The committed SKILL.md is the expected result: this proves it is exactly
// what init generates, not something edited by hand.
const COMMITTED = fileURLToPath(new URL("../SKILL.md", import.meta.url));

test("init generates exactly the committed SKILL.md", () => {
  const target = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "skill-")), "SKILL.md");
  init(target);
  assert.equal(fs.readFileSync(target, "utf8"), fs.readFileSync(COMMITTED, "utf8"));
});
