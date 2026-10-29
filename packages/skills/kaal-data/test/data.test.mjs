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
const node = () => identify(readFileSync(join(CAPABILITY, "Data.md")));
const text = () => readFileSync(join(CAPABILITY, "Data.md"), "utf8");

describe("the Capability Node", () => {
  it("is typed by Core's KAAL Capability", () => {
    const capability = node();
    assert.equal(capability.name, "Data");
    assert.deepEqual(capability.type, foundation().capability);
  });

  it("states Data Management's bounded responsibility", () => {
    assert.match(text(), /^Data is the responsibility for Data Management: managing data so that it warrants the trust placed in it\./m);
    assert.match(text(), /how data is organized, by classification and by schemas, formats and data models where these are genuinely generic; how it is stewarded; its quality; its provenance; and its lifecycle/);
    assert.match(text(), /Its scope is that alone\./);
  });

  it("leaves each consumer's data its own, and keeps no store, registry or catalog", () => {
    assert.match(text(), /^Each consuming capability keeps the meaning of its own data and the decisions made with it\./m);
    assert.match(text(), /Data says how data is managed, never what a capability's data means, and containing data does not make anything Data's\./);
    assert.match(text(), /Data keeps no store, registry or catalog of its own\./);
  });

  it("requires Core's KAAL Capability for admission, and nothing else", () => {
    assert.match(text(), /^For admission it requires Core's KAAL Capability, and nothing else\.$/m);
  });

  it("leaves each neighbour its specialized mechanism", () => {
    assert.match(text(), /Nodes, Edges, identity and traversal are Graph's; Graph relies on Data Management, and that dependency transfers no ownership in either direction\./);
    assert.match(text(), /Forming knowledge, and making content retrievable in its context, are Learning's\./);
    assert.match(text(), /Cryptographic integrity is Sealing's\./);
    assert.match(text(), /Evidence is Testing's, and assurance about controls is Controls'\./);
    assert.match(text(), /Storage and its mechanics are Hosting's, and where data is placed is decided by the context that holds it\./);
  });
});

describe("admission", () => {
  it("is admitted as a Capability by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-data-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "data", await readContribution(CAPABILITY));
    assert.deepEqual(r.ids, [node().id]);
    assert.deepEqual((await catalog(engine)).capabilities, [{ name: "Data", id: node().id }]);
    assert.equal((await verify(engine)).ok, true);
  });
});

describe("Data's own claim", () => {
  it("names the Capability Node by its kind and exact name and id, and claims Data's tree", () => {
    const capability = node();
    const { claim, finding } = readClaim(`packages/skills/kaal-data/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", name: capability.name, id: capability.id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-data/"]);
  });
});

describe("the package", () => {
  it("packs its Node and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/Data.md",
      "package.json",
    ]);
  });
});
