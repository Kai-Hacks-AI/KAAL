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

describe("kaal-review", () => {
  it("delivers Review in Form, typed by Core's KAAL Skill", () => {
    const node = identify(readFileSync(join(PAYLOAD, "Review.md")));
    assert.equal(node.name, "Review");
    assert.deepEqual(node.type, foundation().skill);
  });

  it("delivers HOW ARE WE DOING? in Form, typed by Core's KAAL Definition", () => {
    const node = identify(readFileSync(join(PAYLOAD, "HOW-ARE-WE-DOING.md")));
    assert.equal(node.name, "HOW ARE WE DOING?");
    assert.deepEqual(node.type, foundation().definition);
  });

  it("delivers TOGETHER WE CAN GO FAR in Form, typed by Core's KAAL Definition", () => {
    const node = identify(readFileSync(join(PAYLOAD, "TOGETHER-WE-CAN-GO-FAR.md")));
    assert.equal(node.name, "TOGETHER WE CAN GO FAR");
    assert.deepEqual(node.type, foundation().definition);
  });

  it("claims its own tree by Review's exact name and id", () => {
    const node = identify(readFileSync(join(PAYLOAD, "Review.md")));
    const { claim, finding } = readClaim(`packages/skills/kaal-review/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "skill", name: node.name, id: node.id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-review/"]);
  });

  it("is an Agent Skill the Engineer Skill finds conformant", async () => {
    assert.deepEqual(checkSkill("kaal-review", await read(join(PACKAGE, "skills", "kaal-review"))), { standard: [], kaal: [], warnings: [] });
  });

  it("is admitted into a fresh Engine with all its Nodes, and discovered there as a Skill", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-review-"));
    await bootstrap(dir);
    const before = new Set((await loadEngine(dir)).nodes.map((n) => n.id));
    await register(dir, "skill", "kaal-review", await readContribution(PAYLOAD));
    const added = (await loadEngine(dir)).nodes.map((n) => n.id).filter((id) => !before.has(id));
    const ids = ["Review.md", "HOW-ARE-WE-DOING.md", "TOGETHER-WE-CAN-GO-FAR.md"].map((f) => identify(readFileSync(join(PAYLOAD, f))).id);
    assert.deepEqual(added.sort(), ids.sort());
    assert.deepEqual((await catalog(dir)).skills.map((r) => r.name), ["Review"]);
  });

  it("packs its Nodes, the Agent Skill and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "package.json",
      "payload/HOW-ARE-WE-DOING.md",
      "payload/Review.md",
      "payload/TOGETHER-WE-CAN-GO-FAR.md",
      "skills/kaal-review/SKILL.md",
    ]);
  });
});
