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
const definition = () => readFileSync(join(CAPABILITY, "Change-Definition.md"), "utf8");

describe("the Capability Node", () => {
  it("is typed by Core's KAAL Capability", () => {
    const capability = node("Change.md");
    assert.equal(capability.name, "Change");
    assert.deepEqual(capability.type, foundation().capability);
  });

  it("declares what it provides and what admission requires, apart from what it uses", () => {
    const text = readFileSync(join(CAPABILITY, "Change.md"), "utf8");
    assert.match(text, /^It provides the Change Definition, the Change Record Definition, the Change Lifecycle Definition, the RATIFICATION Definition and the CHAOS Definition\. For admission it requires Core's KAAL Capability and KAAL Definition, and nothing else\.$/m);
    assert.match(text, /^Its functional relationships are uses, not ownership\./m);
    assert.match(text, /It uses Testing for verification and Review for validation/);
  });

  it("coordinates GLUE's concerns without owning them or ordering them", () => {
    const text = readFileSync(join(CAPABILITY, "Change.md"), "utf8");
    assert.match(text, /Describe Intent, Define Requirements, Design Architecture, Develop Code, Do IT and Detect Defects/);
    assert.match(text, /it does not own their semantics, artifacts, implementations or tests, and they are not stages it must run in order/);
  });
});

describe("the Change Definition", () => {
  it("is typed by Core's KAAL Definition and distinct from the Capability Node", () => {
    const change = node("Change-Definition.md");
    assert.equal(change.name, "Change");
    assert.deepEqual(change.type, foundation().definition);
    assert.notEqual(change.id, node("Change.md").id);
  });

  it("is self-contained by being judgeable on its own, with the work kept by its owners", () => {
    assert.match(definition(), /it can be understood and judged on its own/);
    assert.match(definition(), /The work stays where the capability that owns it keeps it; the record is not a second copy of it\./);
  });

  it("keeps the Change apart from its realization and from the Outcome", () => {
    assert.match(definition(), /a pull request is one realization of a Change/);
    assert.match(definition(), /Integrating a Change does not prove that the Intent it realizes achieved its Outcome\./);
  });
});

describe("admission", () => {
  it("is admitted as a Capability by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-change-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "change", await readContribution(CAPABILITY));
    assert.deepEqual(r.ids, [node("Change.md").id]);
    assert.deepEqual((await catalog(engine)).capabilities, [{ name: "Change", id: node("Change.md").id }]);
    assert.equal((await verify(engine)).ok, true);
  });
});

describe("Change's own claim", () => {
  it("names the Capability Node by its kind and exact name and id, and claims Change's tree", () => {
    const capability = node("Change.md");
    const { claim, finding } = readClaim(`packages/skills/kaal-change/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", name: capability.name, id: capability.id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-change/"]);
  });
});

describe("the package", () => {
  it("packs its Nodes, the record path syntax, and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/CHAOS.md",
      "capability/Change-Definition.md",
      "capability/Change-Lifecycle.md",
      "capability/Change-Record.md",
      "capability/Change.md",
      "capability/RATIFICATION.md",
      "lib/lifecycle.mjs",
      "lib/record.mjs",
      "package.json",
    ]);
  });
});
