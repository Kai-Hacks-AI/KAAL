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

describe("kaal-architecture", () => {
  it("delivers Architecture in Form, typed by Core's KAAL Skill", () => {
    const node = identify(readFileSync(join(PAYLOAD, "Architecture.md")));
    assert.equal(node.name, "Architecture");
    assert.deepEqual(node.type, foundation().skill);
  });

  it("delivers URBAN in Form, typed by Core's KAAL Definition", () => {
    const node = identify(readFileSync(join(PAYLOAD, "URBAN.md")));
    assert.equal(node.name, "URBAN");
    assert.deepEqual(node.type, foundation().definition);
  });

  it("defines each letter of URBAN, and keeps price out of the Rent and Buy distinction", () => {
    const text = readFileSync(join(PAYLOAD, "URBAN.md"), "utf8");
    for (const letter of ["Use", "Rent", "Buy", "Adapt", "New"]) assert.match(text, new RegExp(`^- \\*\\*${letter}\\*\\* — `, "m"));
    assert.match(text, /price is not their distinction/);
    assert.match(text, /decision-relative and compositional/);
  });

  it("claims its own tree by Architecture's exact name and id", () => {
    const node = identify(readFileSync(join(PAYLOAD, "Architecture.md")));
    const { claim, finding } = readClaim(`packages/skills/kaal-architecture/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "skill", name: node.name, id: node.id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-architecture/"]);
  });

  it("is an Agent Skill the Engineer Skill finds conformant", async () => {
    assert.deepEqual(checkSkill("kaal-architecture", await read(join(PACKAGE, "skills", "kaal-architecture"))), { standard: [], kaal: [], warnings: [] });
  });

  it("is admitted into a fresh Engine with both its Nodes, and discovered there as a Skill", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-architecture-"));
    await bootstrap(dir);
    const before = new Set((await loadEngine(dir)).nodes.map((n) => n.id));
    await register(dir, "skill", "kaal-architecture", await readContribution(PAYLOAD));
    const added = (await loadEngine(dir)).nodes.map((n) => n.id).filter((id) => !before.has(id));
    const ids = ["Architecture.md", "URBAN.md"].map((f) => identify(readFileSync(join(PAYLOAD, f))).id);
    assert.deepEqual(added.sort(), ids.sort());
    assert.deepEqual((await catalog(dir)).skills.map((r) => r.name), ["Architecture"]);
  });

  it("packs its Nodes, the Agent Skill and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "package.json",
      "payload/Architecture.md",
      "payload/URBAN.md",
      "skills/kaal-architecture/SKILL.md",
    ]);
  });
});
