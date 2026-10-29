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
const newNode = () => identify(readFileSync(join(CAPABILITY, "NEW.md")));
const newText = () => readFileSync(join(CAPABILITY, "NEW.md"), "utf8");
const preachNode = () => identify(readFileSync(join(CAPABILITY, "PREACH.md")));
const preachText = () => readFileSync(join(CAPABILITY, "PREACH.md"), "utf8");

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
    assert.match(text(), /^It provides the NEW and PREACH Definitions\. For admission it requires Core's KAAL Capability, and nothing else\.$/m);
    assert.match(text(), /it keeps no session state of its own\./);
    assert.match(text(), /Readiness does not depend on any host loading anything without being asked, and it authorizes nothing\.$/m);
  });
});

describe("the NEW Definition", () => {
  it("is typed by Core's KAAL Definition and distinct from the Capability Node", () => {
    assert.equal(newNode().name, "NEW");
    assert.deepEqual(newNode().type, foundation().definition);
    assert.notEqual(newNode().id, node().id);
  });

  it("carries its expansion and the readiness ambition with little or no prompting, in every setting", () => {
    assert.match(newText(), /^Next Experience Works\.$/m);
    assert.match(newText(), /An Agent reaches productive work with little or no prompting\./);
    assert.match(newText(), /KAAL engineered in the repository, embedded there, or used from outside it\./);
    assert.match(newText(), /from durable sources rather than from memory of earlier sessions\./);
  });

  it("states an ambition, not a promise of host activation", () => {
    assert.match(newText(), /^NEW states the ambition\. It does not promise that any host loads anything without being asked\.$/m);
  });
});

describe("the PREACH Definition", () => {
  it("is typed by Core's KAAL Definition and distinct from the other Nodes", () => {
    assert.equal(preachNode().name, "PREACH");
    assert.deepEqual(preachNode().type, foundation().definition);
    assert.notEqual(preachNode().id, node().id);
    assert.notEqual(preachNode().id, newNode().id);
  });

  it("carries its expansion and the direction Program, Agent, Human", () => {
    assert.match(preachText(), /^Program Reports Errors, Agent Consults Human\.$/m);
    assert.match(preachText(), /from Program, to Agent, to Human\./);
  });

  it("states each step's obligation", () => {
    assert.match(preachText(), /It invents no semantics: it does not equate, merge, choose or suppress candidates, and what it cannot resolve it reports as unresolved, never as passing\./);
    assert.match(preachText(), /It resolves only what is already authorized\./);
    assert.match(preachText(), /the Agent consults the person accountable for it, and that person decides\./);
    assert.match(preachText(), /^Not every error escalates to a person\./m);
  });

  it("cites HAPTIC without redefining it, and authorizes nothing", () => {
    assert.match(preachText(), /^PREACH runs the other way to HAPTIC, which Controls owns, and does not redefine it\./m);
    assert.doesNotMatch(preachText(), /Human < Agent < Program/);
    assert.match(preachText(), /PREACH authorizes nothing\./);
  });

  it("records its HACKS association as context, and keeps Agents' boundary explicit", () => {
    assert.match(preachText(), /^PREACH and HAPTIC are correlated with HACKS, Human Agent Collaboration Knowledge System,/m);
    assert.match(preachText(), /The association is context only: HACKS is not a capability, and it owns neither\./);
    assert.match(preachText(), /^Agents owns PREACH as the operational principle of how an Agent escalates, and nothing beyond it\. It owns no human decision, no domain's semantics and not HAPTIC\./m);
  });
});

describe("admission", () => {
  it("is admitted as a Capability by Core alone, with the NEW and PREACH Definitions admitted alongside", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-agents-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "agents", await readContribution(CAPABILITY));
    assert.deepEqual(r.ids, [node().id]);
    assert.deepEqual(readFileSync(join(engine, "capabilities", "agents", "NEW.md")), readFileSync(join(CAPABILITY, "NEW.md")));
    assert.deepEqual(readFileSync(join(engine, "capabilities", "agents", "PREACH.md")), readFileSync(join(CAPABILITY, "PREACH.md")));
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
      "capability/NEW.md",
      "capability/PREACH.md",
      "package.json",
    ]);
  });
});
