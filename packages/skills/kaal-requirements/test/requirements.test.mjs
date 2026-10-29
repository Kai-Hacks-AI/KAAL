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
const definition = () => identify(readFileSync(join(CAPABILITY, "Requirement.md")));
const definitionText = () => readFileSync(join(CAPABILITY, "Requirement.md"), "utf8");

describe("the Capability Node", () => {
  it("is typed by Core's KAAL Capability", () => {
    assert.equal(node().name, "Requirements");
    assert.deepEqual(node().type, foundation().capability);
  });

  it("states a positive responsibility: functional and non-functional conditions, a responsible context, precise enough to verify", () => {
    assert.match(text(), /^Requirements is the responsibility for stating what must hold: the functional and non-functional conditions that what is built is to satisfy, each with the context responsible for it and precise enough to be verified\. Its scope is that alone\.$/m);
  });

  it("states what, and only what: no Intent prerequisite, a trigger apart from Intent, and where, how and whether left to their owners", () => {
    assert.match(text(), /^A Requirement states what must hold\. It does not explain, redefine or justify why that is wanted; that is Intent's\./m);
    assert.match(text(), /The trace transfers no ownership, and no separately documented Intent is a prerequisite\./);
    assert.match(text(), /is its trigger\. The trigger is neither the Requirement nor an Intent\./);
    assert.match(text(), /Where what must hold is placed is Architecture's, and how it is built is Code's\. Whether it holds, by test, inspection, analysis or measurement, is Testing's to judge\. None of these is a Requirement\.$/m);
    assert.doesNotMatch(text(), /may arise from an Intent/);
  });

  it("declares what it provides and what admission requires, apart from what it uses", () => {
    assert.match(text(), /^It provides the Requirement Definition\. For admission it requires Core's KAAL Capability, and nothing else\.$/m);
    assert.match(text(), /^Its functional relationships are uses, not ownership\./m);
    assert.match(text(), /Stating a Requirement authorizes nothing\.$/m);
  });
});

describe("the Requirement Definition", () => {
  it("is typed by Core's KAAL Definition", () => {
    assert.equal(definition().name, "Requirement");
    assert.deepEqual(definition().type, foundation().definition);
  });

  it("states what must hold: one functional or non-functional condition, a responsible business context, verifiable by test or other evidence", () => {
    assert.match(definitionText(), /^A Requirement states what must hold\. It is one functional or non-functional condition that what is built is to satisfy, held by the business context responsible for it, and stated precisely enough to be verified by test or other evidence\.$/m);
  });

  it("answers what alone and leaves why, where, how and whether to their owners", () => {
    assert.match(definitionText(), /^It answers what, and only that\. It does not say why \(Intent\), where \(Architecture\), how \(Code\), or whether it holds \(Testing\)\.$/m);
  });

  it("may trace to a represented Intent without depending on it, and keeps its trigger apart", () => {
    assert.match(definitionText(), /^It may name an Intent it traces to, where one is represented\. That trace is a reference, not a dependency, and it transfers no ownership\.$/m);
    assert.match(definitionText(), /^What prompted it to be identified, its trigger, may be recorded beside it\. The trigger is neither the Requirement nor its Intent\.$/m);
    assert.match(definitionText(), /^A condition that cannot be verified is not yet a Requirement\.$/m);
  });
});

describe("admission", () => {
  it("is admitted as a Capability by Core alone, with the Requirement Definition admitted alongside", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-requirements-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "requirements", await readContribution(CAPABILITY));
    assert.deepEqual(r.ids, [node().id]);
    assert.deepEqual(readFileSync(join(engine, "capabilities", "requirements", "Requirement.md")), readFileSync(join(CAPABILITY, "Requirement.md")));
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
  it("packs its Node and Definition and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/Requirement.md",
      "capability/Requirements.md",
      "package.json",
    ]);
  });
});
