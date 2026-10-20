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
    const capability = node("Project.md");
    assert.equal(capability.name, "Project");
    assert.deepEqual(capability.type, foundation().capability);
  });

  it("declares what it provides and what admission requires", () => {
    assert.match(text("Project.md"), /^It provides the Project Plan Definition\. For admission it requires Core's KAAL Capability and KAAL Definition, and nothing else\.$/m);
  });

  it("states where its responsibility starts and ends, and when no Project is needed", () => {
    const capability = text("Project.md");
    assert.match(capability, /starts where a selected increment needs several related Changes, and ends at the Project's exit/);
    assert.match(capability, /Neither a capability increment nor several independent Changes needs a Project\./);
  });

  it("realizes Project first, with Program and Portfolio in scope and not yet realized", () => {
    assert.match(text("Project.md"), /Project is realized first; Program, .+ and Portfolio, .+ are within its scope and not yet realized\./);
  });

  it("transfers no functional ownership by coordinating", () => {
    const capability = text("Project.md");
    assert.match(capability, /^Coordination transfers no functional ownership\./m);
    assert.match(capability, /Each Change keeps its own lifecycle, which is Change's/);
    assert.match(capability, /The Outcome and what it means are Intent's/);
  });
});

describe("the Project Plan Definition", () => {
  it("is typed by Core's KAAL Definition", () => {
    const definition = node("Project-Plan.md");
    assert.equal(definition.name, "Project Plan");
    assert.deepEqual(definition.type, foundation().definition);
  });

  it("names what a Plan states", () => {
    const definition = text("Project-Plan.md");
    for (const part of ["Outcome", "Changes", "Ordering", "Grouping", "Risks", "Exit condition"]) {
      assert.match(definition, new RegExp(`^- \\*\\*${part}\\*\\*: `, "m"), part);
    }
  });

  it("does not take integrated Changes for a met exit", () => {
    assert.match(text("Project-Plan.md"), /Every Change in it being integrated does not by itself meet its exit condition, because integrating a Change does not prove an Outcome\./);
  });

  it("is kept in the context of the work it coordinates", () => {
    assert.match(text("Project-Plan.md"), /A Plan is kept in the context of the work it coordinates\./);
  });
});

describe("admission", () => {
  it("is admitted as a Capability by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-project-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "project", await readContribution(CAPABILITY));
    assert.deepEqual(r.ids, [node("Project.md").id]);
    assert.deepEqual((await catalog(engine)).capabilities, [{ name: "Project", id: node("Project.md").id }]);
    assert.equal((await verify(engine)).ok, true);
  });
});

describe("Project's own claim", () => {
  it("names the Capability Node by its kind and exact name and id, and claims Project's tree", () => {
    const capability = node("Project.md");
    const { claim, finding } = readClaim(`packages/skills/kaal-project/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", name: capability.name, id: capability.id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-project/"]);
  });
});

describe("the package", () => {
  it("packs its Nodes and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/Project-Plan.md",
      "capability/Project.md",
      "package.json",
    ]);
  });
});
