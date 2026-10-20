// Deterministic verification of what can be decided mechanically: the Nodes'
// Form and type, admission into an Engine, the ownership claim, what the
// package delivers, and the contract's key statements as written.
// Whether the Nodes say the right thing is validation, by independent Agent
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
const node = (file) => identify(readFileSync(join(CAPABILITY, file)));
const text = (file) => readFileSync(join(CAPABILITY, file), "utf8");

describe("the Capability Node", () => {
  it("is typed by Core's KAAL Capability", () => {
    const capability = node("Product.md");
    assert.equal(capability.name, "Product");
    assert.deepEqual(capability.type, foundation().capability);
  });

  it("declares what it provides and what admission requires", () => {
    assert.match(text("Product.md"), /^It provides the Product Direction Definition\. For admission it requires Core's KAAL Capability and KAAL Definition, and nothing else\.$/m);
  });

  it("states where its responsibility starts and ends", () => {
    assert.match(text("Product.md"), /starts where the Product Owner gives direction or an Intent asks for an increment, and ends when an increment has been selected and ordered/);
  });

  it("leaves every decision with the Product Owner", () => {
    assert.match(text("Product.md"), /The Product Owner decides; Product prepares each decision and records the choice as it was made, and decides nothing itself\./);
  });

  it("leaves Intent, Change and Project their own responsibilities, and keeps no store", () => {
    const capability = text("Product.md");
    assert.match(capability, /What an Intent means and what its Outcome is are Intent's\./);
    assert.match(capability, /its own lifecycle, which is Change's; coordinating several related Changes is Project's/);
    assert.match(capability, /Product keeps no store of its own/);
  });
});

describe("the Product Direction Definition", () => {
  it("is typed by Core's KAAL Definition", () => {
    const definition = node("Product-Direction.md");
    assert.equal(definition.name, "Product Direction");
    assert.deepEqual(definition.type, foundation().definition);
  });

  it("names its concepts", () => {
    const definition = text("Product-Direction.md");
    for (const concept of ["Wanted increment", "Backlog", "Roadmap", "Priority", "Decision preparation"]) {
      assert.match(definition, new RegExp(`^- \\*\\*${concept}\\*\\*: `, "m"), concept);
    }
  });

  it("keeps a roadmap an intention, and selection apart from delivery", () => {
    const definition = text("Product-Direction.md");
    assert.match(definition, /It states intention, not commitment\./);
    assert.match(definition, /Selecting an increment authorizes it and does not deliver it\./);
    assert.match(definition, /Preparing a decision decides nothing/);
  });
});

describe("admission", () => {
  it("is admitted as a Capability by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-product-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "product", await readContribution(CAPABILITY));
    assert.deepEqual(r.ids, [node("Product.md").id]);
    assert.deepEqual((await catalog(engine)).capabilities, [{ name: "Product", id: node("Product.md").id }]);
    assert.equal((await verify(engine)).ok, true);
  });
});

describe("Product's own claim", () => {
  it("names the Capability Node by its kind and exact name and id, and claims Product's tree", () => {
    const capability = node("Product.md");
    const { claim, finding } = readClaim(`packages/skills/kaal-product/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", name: capability.name, id: capability.id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-product/"]);
  });
});

describe("the package", () => {
  it("packs its Nodes and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/Product-Direction.md",
      "capability/Product.md",
      "package.json",
    ]);
  });
});
