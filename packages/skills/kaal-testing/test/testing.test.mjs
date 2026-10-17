// Deterministic verification of what can be decided mechanically: the Node's
// Form and type, Agent Skill conformance, admission into an Engine, and what
// the package delivers. Conformance and admission are owned by the Engineer
// Skill and Core, so only Testing's integration with them is shown here. What
// the Node and the Agent Skill mean is not verified here: that is validation,
// by independent Agent or human review.
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, capabilities, foundation, identify, readContribution, registerSkill } from "kaal-core";
import { checkSkill } from "kaal-engineer-skill";
import { execute, read, readFile } from "kaal-hosting";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));
const PAYLOAD = join(PACKAGE, "payload");
const SKILL = join(PACKAGE, "skills", "kaal-testing");

describe("kaal-testing", () => {
  it("delivers one Node in Form, typed by Core's KAAL Skill", async () => {
    const node = identify(await readFile(join(PAYLOAD, "Testing.md")));
    assert.equal(node.name, "Testing");
    assert.deepEqual(node.type, foundation().skill);
  });

  it("is an Agent Skill the Engineer Skill finds conformant", async () => {
    assert.deepEqual(checkSkill("kaal-testing", await read(SKILL)), { standard: [], kaal: [], warnings: [] });
  });

  it("is admitted into a fresh Engine and discovered there as a Skill", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-"));
    await bootstrap(dir);
    await registerSkill(dir, "kaal-testing", await readContribution(PAYLOAD));
    assert.deepEqual((await capabilities(dir)).skills.map((r) => r.name), ["Testing"]);
  });

  it("packs the Node, the Agent Skill and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "lib/coverage.mjs",
      "package.json",
      "payload/Testing.md",
      "skills/kaal-testing/SKILL.md",
      "skills/kaal-testing/references/findings.md",
    ]);
  });
});
