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
const node = () => identify(readFileSync(join(CAPABILITY, "Agents.md")));
const text = () => readFileSync(join(CAPABILITY, "Agents.md"), "utf8");

describe("the Capability Node", () => {
  it("is typed by Core's KAAL Capability and distinct from Core's KAAL Agent", () => {
    assert.equal(node().name, "Agents");
    assert.deepEqual(node().type, foundation().capability);
    assert.notEqual(node().id, foundation().agent.id);
  });

  it("states a positive responsibility: readiness and operation with little or no prompting, in every setting", () => {
    assert.match(text(), /^Agents is the responsibility for an Agent's readiness and operation within KAAL: an Agent reconstructing its working context from durable sources, with little or no prompting, and entering productive work, whether KAAL is engineered in the repository it works in, embedded there, or used from outside it\. Its scope is that alone\.$/m);
  });

  it("starts where Core ends and ends where the work an Agent takes up begins", () => {
    assert.match(text(), /^It starts where Core ends\. What a KAAL Agent is, and its admission, registration and discovery, are Core's\./m);
    assert.match(text(), /what is wanted is Intent's, the course of a Change is Change's, where content goes is Communication's, and producing Skills is the Engineer Skill's\./);
  });

  it("declares what it provides and requires, keeps no state and relies on no host activation", () => {
    assert.match(text(), /^It provides no Definition yet\. For admission it requires Core's KAAL Capability, and nothing else\.$/m);
    assert.match(text(), /it keeps no session state of its own\./);
    assert.match(text(), /Readiness does not depend on any host loading anything without being asked, and it authorizes nothing\.$/m);
  });
});

describe("admission", () => {
  it("is admitted as a Capability by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-agents-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "agents", await readContribution(CAPABILITY));
    assert.deepEqual(r.ids, [node().id]);
    assert.deepEqual((await catalog(engine)).capabilities, [{ name: "Agents", id: node().id }]);
    assert.deepEqual((await catalog(engine)).agents, []);
    assert.equal((await verify(engine)).ok, true);
  });
});

describe("Agents' own claim", () => {
  it("names the Capability Node by its kind and exact name and id, and claims Agents' tree", () => {
    const { claim, finding } = readClaim(`packages/skills/kaal-agents/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", name: node().name, id: node().id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-agents/"]);
  });
});

describe("the package", () => {
  it("packs its Node and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/Agents.md",
      "package.json",
    ]);
  });
});
