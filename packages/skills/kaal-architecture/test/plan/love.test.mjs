// architecture/C4: the planned tests of Packaging Readiness (LOVE), packages/skills/kaal-architecture/plan/love/testing.md.
// They are immutable to DO and CHECK. They run outside the package's `npm test` until architecture/C5 turns them GREEN.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, catalog, foundation, loadEngine, readContribution, register, verify } from "kaal-core";
import { renderSkill } from "kaal-core/agent";
import { realizeIn } from "kaal-core/realization";
import { identify } from "kaal-graph";
import { readFrontmatter } from "kaal-graph/form";
import { execute, read } from "kaal-hosting";
import { CLAIM_FILE, readClaim } from "kaal-testing/attribution";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const PAYLOAD = join(PACKAGE, "payload");
const SKILL = join(PACKAGE, "skills", "kaal-architecture");
const TARGET = ".agents/skills/kaal-architecture";
const RECORD = ".kaal/state/architecture/installation.json";

const contract = () => JSON.parse(readFileSync(join(PACKAGE, "contract.json"), "utf8"));
const version = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).version;
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** The body's `## Description` section, without its heading and surrounding blank lines. */
function descriptionSection(text) {
  const body = text.slice(text.indexOf("\n---\n", 3) + 5);
  const match = body.match(/^## Description\n([\s\S]*?)(?=^#{1,2} |(?![\s\S]))/m);
  return match?.[1].trim();
}

describe("kaal-architecture: Packaging Readiness (LOVE)", () => {
  it("architecture/T1: contract.json is an Installation Contract for the Capability architecture at the package's version, delivering the Agent Skill as one directory asset with its record, on Node 24 [architecture/F1, architecture/N2]", () => {
    const c = contract();
    assert.deepEqual(c.format, { name: "Installation Contract", id: "20c46d8e84ac4502d3b4a2b497f75f8bd999fb826ee5f85b6912b77afaaefa5b" });
    assert.equal(c.capability, "architecture");
    assert.equal(c.version, version());
    assert.deepEqual(c.assets, [{ name: "skill", source: "skills/kaal-architecture", target: TARGET, kind: "directory" }]);
    assert.equal(c.record, RECORD);
    assert.deepEqual(c.runtime, { node: 24 });
    assert.deepEqual(c.provides, [{ skill: "kaal-architecture" }]);
  });

  it("architecture/T2: the catalogue holds the SHA-256 of the current bytes of every file under the Skill's target, and the contract's version is the package's [architecture/F2]", async () => {
    const c = contract();
    assert.equal(c.version, version());
    const files = await read(SKILL);
    assert.ok(Object.keys(files).length > 0);
    for (const [path, bytes] of Object.entries(files)) {
      assert.ok(c.catalogue[`${TARGET}/${path}`]?.includes(sha256(bytes)), `${TARGET}/${path} is catalogued at its current bytes`);
    }
  });

  it("architecture/T3: Core realizes the Agent Skill from contract.json only at its canonical target, registering it in Architecture's record, and renders its description from ## Description [architecture/F1, architecture/F5]", async () => {
    const source = readFileSync(join(SKILL, "SKILL.md"));
    const section = descriptionSection(source.toString("utf8"));
    assert.ok(section, "the Agent Skill has a ## Description section");
    assert.equal(readFrontmatter(renderSkill(source)).description, section);
    assert.equal(readFrontmatter(source).description, section);

    const root = mkdtempSync(join(tmpdir(), "kaal-architecture-love-"));
    const realized = await realizeIn(root, { skills: [{ name: "kaal-architecture", files: await read(SKILL) }], contracts: [contract()] });
    assert.deepEqual(realized.records, [RECORD]);
    const placed = Object.keys(await read(root)).filter((p) => p !== RECORD).sort();
    assert.deepEqual(placed, Object.keys(await read(SKILL)).map((p) => `${TARGET}/${p}`).sort());
    const record = JSON.parse(readFileSync(join(root, RECORD), "utf8"));
    assert.deepEqual(Object.keys(record.assets).sort(), placed);
  });

  it("architecture/T4: Core admits Architecture as a KAAL Capability, with URBAN, into a fresh Engine that verifies, and the ownership claim names it by kind capability [architecture/F3]", async () => {
    const node = identify(readFileSync(join(PAYLOAD, "Architecture.md")));
    assert.deepEqual(node.type, foundation().capability);
    assert.deepEqual(identify(readFileSync(join(PAYLOAD, "URBAN.md"))).type, foundation().definition);

    const dir = mkdtempSync(join(tmpdir(), "kaal-architecture-love-"));
    await bootstrap(dir);
    await register(dir, "capability", "kaal-architecture", await readContribution(PAYLOAD));
    assert.deepEqual((await catalog(dir)).capabilities.map((r) => r.name), ["Architecture"]);
    const ids = (await loadEngine(dir)).nodes.map((n) => n.id);
    for (const f of ["Architecture.md", "URBAN.md"]) assert.ok(ids.includes(identify(readFileSync(join(PAYLOAD, f))).id), `${f} is admitted`);
    const verified = await verify(dir);
    assert.deepEqual(verified.problems, []);
    assert.equal(verified.ok, true);

    const { claim, finding } = readClaim(`packages/skills/kaal-architecture/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", name: node.name, id: node.id });
  });

  it("architecture/T5: the Node Architecture states its boundary with Requirements [architecture/F4]", () => {
    const text = readFileSync(join(PAYLOAD, "Architecture.md"), "utf8");
    assert.match(text, /Requirements states what must hold/);
    assert.match(text, /Architecture places the behaviour a Requirement asks for/);
  });

  it("architecture/T6: the packed package holds exactly its two Nodes, the Agent Skill, contract.json and its metadata, and exports only ./package.json [architecture/F6, architecture/A1]", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "contract.json",
      "package.json",
      "payload/Architecture.md",
      "payload/URBAN.md",
      "skills/kaal-architecture/SKILL.md",
    ]);
    assert.deepEqual(JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).exports, { "./package.json": "./package.json" });
  });

  it("architecture/T7: nothing the package ships imports a module, and it has no dependencies [architecture/N1]", async () => {
    const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    assert.equal(pkg.dependencies, undefined);
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    for (const { path } of JSON.parse(r.stdout)[0].files) assert.doesNotMatch(path, /\.(c|m)?[jt]sx?$/, `${path} is not a module`);
  });
});
