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

  it("agents/T28 [agents/F13]: the root file makes an Agent KAAL aware and points at the package Skills", () => {
    assert.match(root, /\.kaal\/AGENTS\.md/, "points at the Engine's notes");
    assert.match(root, /kaal list/, "points at Core's list");
    assert.match(root, /packages\/<package>\/AGENTS\.md|package.{0,40}own `?AGENTS\.md/i, "points at each package's own AGENTS.md");
    assert.match(root, /never authoriz|no authority/i, "guides and does not authorize");
  });
});
