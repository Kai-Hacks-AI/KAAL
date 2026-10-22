import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, catalog, foundation, loadEngine, readContribution, register } from "kaal-core";
import { checkSkill } from "kaal-engineer-skill";
import { identify } from "kaal-graph";
import { execute, read } from "kaal-hosting";
import { CLAIM_FILE, readClaim } from "kaal-testing/attribution";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));
const PAYLOAD = join(PACKAGE, "payload");

describe("kaal-learning", () => {
  it("delivers Learning in Form, typed by Core's KAAL Skill", () => {
    const node = identify(readFileSync(join(PAYLOAD, "Learning.md")));
    assert.equal(node.name, "Learning");
    assert.deepEqual(node.type, foundation().skill);
  });

  it("delivers BRAIN in Form, typed by Core's KAAL Definition", () => {
    const node = identify(readFileSync(join(PAYLOAD, "BRAIN.md")));
    assert.equal(node.name, "BRAIN");
    assert.deepEqual(node.type, foundation().definition);
  });

  it("claims its own tree by Learning's exact name and id", () => {
    const node = identify(readFileSync(join(PAYLOAD, "Learning.md")));
    const { claim, finding } = readClaim(`packages/skills/kaal-learning/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "skill", name: node.name, id: node.id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-learning/"]);
  });

  it("is an Agent Skill the Engineer Skill finds conformant", async () => {
    assert.deepEqual(checkSkill("kaal-learning", await read(join(PACKAGE, "skills", "kaal-learning"))), { standard: [], kaal: [], warnings: [] });
  });

  it("is admitted into a fresh Engine with both its Nodes, and discovered there as a Skill", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-learning-"));
    await bootstrap(dir);
    const before = new Set((await loadEngine(dir)).nodes.map((n) => n.id));
    await register(dir, "skill", "kaal-learning", await readContribution(PAYLOAD));
    const added = (await loadEngine(dir)).nodes.map((n) => n.id).filter((id) => !before.has(id));
    const ids = ["Learning.md", "BRAIN.md"].map((f) => identify(readFileSync(join(PAYLOAD, f))).id);
    assert.deepEqual(added.sort(), ids.sort());
    assert.deepEqual((await catalog(dir)).skills.map((r) => r.name), ["Learning"]);
  });

  it("packs its Nodes, the Agent Skill and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "package.json",
      "payload/BRAIN.md",
      "payload/Learning.md",
      "skills/kaal-learning/SKILL.md",
    ]);
  });
});
