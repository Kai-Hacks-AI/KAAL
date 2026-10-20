// Deterministic verification of what can be decided mechanically: the Node's
// Form and type, admission into an Engine, the ownership claim, what the
// package delivers, and the contract's key statements as written.
// Whether the Node says the right thing is validation, by independent Agent
// or human review.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, catalog, foundation, readContribution, register, verify } from "kaal-core";
import { identify } from "kaal-graph";
import { execute } from "kaal-hosting";
import { CLAIM_FILE, readClaim } from "kaal-testing/attribution";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));
const CAPABILITY = join(PACKAGE, "capability");
const node = () => identify(readFileSync(join(CAPABILITY, "Requirements.md")));
const text = () => readFileSync(join(CAPABILITY, "Requirements.md"), "utf8");

describe("the Capability Node", () => {
  it("is typed by Core's KAAL Capability", () => {
    assert.equal(node().name, "Requirements");
    assert.deepEqual(node().type, foundation().capability);
  });

  it("states a positive responsibility, functional and non-functional, stated so that it can be verified", () => {
    assert.match(text(), /^Requirements is the responsibility for stating what must hold of what is built: the functional and non-functional requirements that a Change or a product is to satisfy, each stated so that it can be verified\. Its scope is that alone\.$/m);
  });

  it("starts where an Intent ends and ends at placement and verification", () => {
    assert.match(text(), /^It starts where an Intent ends\./m);
    assert.match(text(), /which is architecture's/);
    assert.match(text(), /their evidence judged, which is Testing's\. Neither placement, nor tests, nor evidence is a Requirement\./);
  });

  it("declares what it provides and what admission requires, apart from what it uses", () => {
    assert.match(text(), /^It provides no Definition yet\. For admission it requires Core's KAAL Capability, and nothing else\.$/m);
    assert.match(text(), /^Its functional relationships are uses, not ownership\./m);
    assert.match(text(), /Stating a Requirement authorizes nothing\.$/m);
  });
});

describe("admission", () => {
  it("is admitted as a Capability by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-requirements-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "requirements", await readContribution(CAPABILITY));
    assert.deepEqual(r.ids, [node().id]);
    assert.deepEqual((await catalog(engine)).capabilities, [{ name: "Requirements", id: node().id }]);
    assert.equal((await verify(engine)).ok, true);
  });
});

describe("Requirements' own claim", () => {
  it("names the Capability Node by its kind and exact name and id, and claims Requirements' tree", () => {
    const { claim, finding } = readClaim(`packages/skills/kaal-requirements/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", name: node().name, id: node().id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-requirements/"]);
  });
});

describe("the package", () => {
  it("packs its Node and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/Requirements.md",
      "package.json",
    ]);
  });
});
