// The planned tests of agents/C13, the root AGENTS.md as KAAL awareness (plan/root-instructions-0.0.1/plan.md).
// DO and CHECK do not change them. Each fails today on the root file's text.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../../../../", import.meta.url));
const root = readFileSync(join(ROOT, "AGENTS.md"), "utf8");

describe("agents/C13 root instruction file", () => {
  it("agents/T27 [agents/F13]: the root file holds no package rule", () => {
    assert.doesNotMatch(root, /node:crypto/, "no crypto rule");
    assert.doesNotMatch(root, /\bnpx\b|npm exec/, "no command rule");
    assert.doesNotMatch(root, /sha-?256/i, "no digest rule");
    assert.doesNotMatch(root, /^##\s+(?:Foundation|Hosting|Guard|Graph)\b/m, "no section for a single package");
  });

  it("agents/T28 [agents/F13]: the root file is a pointer to the Engine, says it guides and never authorizes, and stays short", () => {
    assert.match(root, /\.kaal\/AGENTS\.md/, "points at the Engine's notes");
    assert.match(root, /\.kaal\//, "points at the Engine");
    assert.ok(root.split("\n").length <= 10, "stays a pointer, not a rulebook");
    assert.match(root, /never authoriz|no authority/i, "guides and does not authorize");
  });
});
