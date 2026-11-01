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
import { bootstrap, catalog, foundation, readContribution, register } from "kaal-core";
import { identify } from "kaal-graph";
import { checkSkill } from "kaal-engineer-skill";
import { execute, read, readFile } from "kaal-hosting";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));
const PAYLOAD = join(PACKAGE, "payload");
const CAPABILITY = join(PACKAGE, "capability");
const SKILL = join(PACKAGE, "skills", "kaal-testing");

describe("kaal-testing", () => {
  it("delivers one Node in Form, typed by Core's KAAL Skill", async () => {
    const node = identify(await readFile(join(PAYLOAD, "Testing.md")));
    assert.equal(node.name, "Testing");
    assert.deepEqual(node.type, foundation().skill);
  });

  it("delivers its Capability Node in Form, typed by Core's KAAL Capability", async () => {
    const node = identify(await readFile(join(CAPABILITY, "Testing.md")));
    assert.equal(node.name, "Testing");
    assert.deepEqual(node.type, foundation().capability);
  });

  it("is an Agent Skill the Engineer Skill finds conformant", async () => {
    assert.deepEqual(checkSkill("kaal-testing", await read(SKILL)), { standard: [], kaal: [], warnings: [] });
  });

  it("is admitted into a fresh Engine and discovered there as a Capability and a Skill", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-"));
    await bootstrap(dir);
    await register(dir, "capability", "testing", await readContribution(CAPABILITY));
    await register(dir, "skill", "kaal-testing", await readContribution(PAYLOAD));
    const found = await catalog(dir);
    assert.deepEqual([found.capabilities.map((r) => r.name), found.skills.map((r) => r.name)], [["Testing"], ["Testing"]]);
  });

  it("names the published package, @kaihacksai/kaal-testing, in every install, verify, remove and import instruction its shipped documents give", async () => {
    for (const d of ["intent", "requirements", "architecture", "testing", "limitations", "operations"]) {
      const body = (await readFile(join(PACKAGE, "docs", `${d}.md`))).toString("utf8");
      assert.doesNotMatch(body, /\bnpm\s+(install|i|explore|uninstall|rm)\s+kaal-/, `${d}.md gives no npm command for an unscoped package`);
      assert.doesNotMatch(body, /(?<![@/\w])kaal-(testing|hosting|core|graph)(\/[a-z]+)?`/, `${d}.md names no unscoped package or export specifier`);
    }
    const ops = (await readFile(join(PACKAGE, "docs/operations.md"))).toString("utf8");
    for (const c of ["npm install @kaihacksai/kaal-testing", "npm explore @kaihacksai/kaal-testing -- npm test", "npm uninstall @kaihacksai/kaal-testing", "`@kaihacksai/kaal-testing/model`"]) assert.ok(ops.includes(c), `Operations gives ${c}`);
  });

  it("packs its Nodes, its documents, its library, the Agent Skill and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/Testing.md",
      "docs/architecture.md",
      "docs/intent.md",
      "docs/limitations.md",
      "docs/operations.md",
      "docs/requirements.md",
      "docs/testing.md",
      "lib/acceptance.mjs",
      "lib/attribution.mjs",
      "lib/boundary.mjs",
      "lib/contracts.mjs",
      "lib/coverage.mjs",
      "lib/inventory.mjs",
      "lib/model.mjs",
      "lib/observed.mjs",
      "lib/report.mjs",
      "lib/reporter.mjs",
      "lib/timing.mjs",
      "lib/verifiers.mjs",
      "package.json",
      "payload/Testing.md",
      "skills/kaal-testing/SKILL.md",
      "skills/kaal-testing/references/brittle.md",
      "skills/kaal-testing/references/findings.md",
    ]);
  });
});
