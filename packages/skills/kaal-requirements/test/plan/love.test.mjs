// requirements/C6: the planned tests of Packaging Readiness (LOVE), packages/skills/kaal-requirements/plan/love/testing.md.
// They are immutable to DO and CHECK. They run outside the package's `npm test` until requirements/C7 turns them GREEN.
// requirements/T13 is written in requirements/C9, against the interface core/C29 names (see testing.md).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, catalog, foundation, readContribution, register, verify } from "kaal-core";
import { identify } from "kaal-graph";
import { execute } from "kaal-hosting";
import { CLAIM_FILE, readClaim } from "kaal-testing/attribution";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const CAPABILITY = join(PACKAGE, "capability");
const TARGET = ".kaal/capabilities/requirements";
const RECORD = ".kaal/state/requirements/installation.json";

const nodes = () => readdirSync(CAPABILITY).filter((f) => f.endsWith(".md")).sort();
const contractFile = () => {
  const path = join(PACKAGE, "contract.json");
  assert.ok(existsSync(path), "blocked before behavioural assertion: contract.json does not exist");
  return JSON.parse(readFileSync(path, "utf8"));
};
const pkg = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const packed = async () => {
  const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout)[0].files.map((f) => f.path).sort();
};

describe("kaal-requirements: Packaging Readiness (LOVE)", () => {
  it("requirements/T9: contract.json is an Installation Contract for the Capability requirements at the package's version, delivering each Node as a file asset into the Engine, with its record, on Node 24, providing no Skill, and it conforms [requirements/F7, requirements/N4]", async () => {
    const c = contractFile();
    const { checkContract, installationFormat } = await import("kaal-core/installation");
    assert.deepEqual(c.format, installationFormat());
    assert.equal(c.capability, "requirements");
    assert.equal(c.version, pkg().version);
    assert.deepEqual(
      c.assets,
      nodes().map((f) => ({ name: f.replace(/\.md$/, ""), source: `capability/${f}`, target: `${TARGET}/${f}`, kind: "file" })),
    );
    for (const asset of c.assets) assert.equal(asset.surface, undefined);
    assert.equal(c.record, RECORD);
    assert.deepEqual(c.runtime, { node: 24 });
    assert.deepEqual(c.provides, []);
    assert.deepEqual(checkContract(c), []);
  });

  it("requirements/T10: for every asset, the catalogue holds exactly the SHA-256 of its shipped bytes, and the contract's version is the package's [requirements/F7, requirements/F8]", () => {
    const c = contractFile();
    assert.equal(c.version, pkg().version);
    assert.deepEqual(
      c.catalogue,
      Object.fromEntries(nodes().map((f) => [`${TARGET}/${f}`, [sha256(readFileSync(join(CAPABILITY, f)))]])),
    );
  });

  it("requirements/T11: the Node Requirements states that a condition that must not hold is still stated as a Requirement and that a Defect's record is its owner's; Core admits it as a Capability, and the ownership claim names its id [requirements/F10]", async () => {
    const text = readFileSync(join(CAPABILITY, "Requirements.md"), "utf8");
    assert.match(text, /A condition that must not hold is still stated as a Requirement\./);
    assert.match(text, /A Defect, the record that prohibited behaviour was observed, is its owner's, not Requirements'\./);

    const node = identify(readFileSync(join(CAPABILITY, "Requirements.md")));
    assert.deepEqual(node.type, foundation().capability);
    const dir = mkdtempSync(join(tmpdir(), "kaal-requirements-love-"));
    await bootstrap(dir);
    await register(dir, "capability", "requirements", await readContribution(CAPABILITY));
    assert.deepEqual((await catalog(dir)).capabilities, [{ name: "Requirements", id: node.id }]);
    assert.equal((await verify(dir)).ok, true);

    const { claim, finding } = readClaim(`packages/skills/kaal-requirements/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", name: node.name, id: node.id });
  });

  it("requirements/T12: the packed package holds exactly its Nodes, contract.json and its metadata, exports only ./package.json, and the README names each Node and the contract [requirements/F11, requirements/A10]", async () => {
    assert.deepEqual(await packed(), [
      "LICENSE",
      "README.md",
      ...nodes().map((f) => `capability/${f}`),
      "contract.json",
      "package.json",
    ].sort());
    assert.deepEqual(pkg().exports, { "./package.json": "./package.json" });
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    for (const f of nodes()) assert.match(readme, new RegExp(`capability/${f.replace(/\./g, "\\.")}`), `README names capability/${f}`);
    assert.match(readme, /contract\.json/);
  });

  it("requirements/T14: nothing the package ships imports a module, and it has no dependencies [requirements/N3]", async () => {
    assert.equal(pkg().dependencies, undefined);
    for (const path of await packed()) assert.doesNotMatch(path, /\.(c|m)?[jt]sx?$/, `${path} is not a module`);
  });
});
