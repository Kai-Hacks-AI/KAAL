// Deterministic verification of what can be decided mechanically: the Nodes'
// Form and type, admission into an Engine, the ownership claim, what the
// package delivers, and the lifecycle's states and transitions as written.
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

  it("declares what it provides and what it requires", () => {
    const text = readFileSync(join(CAPABILITY, "Change.md"), "utf8");
    assert.match(text, /^It provides the Change Definition\. It requires Core's KAAL Capability and KAAL Definition, and nothing else\.$/m);
  });
});

describe("the Change Definition", () => {
  it("is typed by Core's KAAL Definition and distinct from the Capability Node", () => {
    const change = node("Change-Definition.md");
    assert.equal(change.name, "Change");
    assert.deepEqual(change.type, foundation().definition);
    assert.notEqual(change.id, node("Change.md").id);
  });

  it("names exactly five states, in order", () => {
    const states = [...definition().matchAll(/^- \*\*(\w+)\*\*: /gm)].map((m) => m[1]);
    assert.deepEqual(states, ["Defined", "Proposed", "Approved", "Integrated", "Withdrawn"]);
  });

  it("returns an altered approved Change to Proposed, and ends in Integrated or Withdrawn", () => {
    assert.match(definition(), /A Change altered after it was Approved is Proposed again/);
    assert.match(definition(), /Integrated and Withdrawn are final; correcting either takes a new Change\./);
  });

  it("keeps the Change apart from its realization and from the Outcome", () => {
    assert.match(definition(), /a pull request is one realization of a Change/);
    assert.match(definition(), /Integration does not prove that the Intent it realizes achieved its Outcome\./);
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
  it("packs its Nodes and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/Change-Definition.md",
      "capability/Change.md",
      "package.json",
    ]);
  });
});
