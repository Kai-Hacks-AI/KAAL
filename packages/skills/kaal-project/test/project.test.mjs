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

  it("adds governance over one or more Normal Changes where it is warranted", () => {
    const capability = text("Project.md");
    assert.match(capability, /adding governance over one or more Normal Changes toward a shared Outcome where that governance is warranted/);
    assert.match(capability, /ends at the Project's exit: its integrated Outcome evidenced and judged, or the Project withdrawn/);
    assert.match(capability, /One Normal Change is the minimum, and several are equally valid\./);
    assert.match(capability, /The number of Changes alone is not the trigger: governance may be warranted by complexity, risk, dependencies, coordination or delivery commitments\./);
    assert.match(capability, /No Normal Change needs a Project merely by being one\./);
  });

  it("leaves what a Normal Change is, and Change classification, to Change", () => {
    assert.match(text("Project.md"), /What a Normal Change is, and how Changes are classified and governed as Changes, is Change's\./);
  });

  it("realizes Project first, with Program and Portfolio in scope and not yet realized", () => {
    assert.match(text("Project.md"), /Project is realized first; Program, .+ and Portfolio, .+ are within its scope and not yet realized\./);
  });

  it("transfers no functional ownership by governing", () => {
    const capability = text("Project.md");
    assert.match(capability, /^Governance transfers no functional ownership\./m);
    assert.match(capability, /Project neither decomposes a Change by default nor takes over a Change's authorization, lifecycle, work or evidence\./);
    assert.match(capability, /Each Change keeps its own authorization and lifecycle, which are Change's/);
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
    for (const part of ["Outcome", "Warrant", "Changes", "Ordering", "Grouping", "Risks", "Exit condition"]) {
      assert.match(definition, new RegExp(`^- \\*\\*${part}\\*\\*: `, "m"), part);
    }
  });

  it("governs one or more Normal Changes", () => {
    assert.match(text("Project-Plan.md"), /^A Project Plan states how governance is added over one or more Normal Changes toward one shared Outcome\./m);
  });

  it("neither decomposes, authorizes nor accepts a Change", () => {
    assert.match(text("Project-Plan.md"), /It does not decompose a Change by default, and it neither authorizes nor accepts a Change: each Change is authorized and accepted on its own terms, which are Change's\./);
  });

  it("keeps the integrated Outcome apart from accepting individual Changes", () => {
    assert.match(text("Project-Plan.md"), /Accepting every Change it names does not by itself meet its exit condition, because the acceptance of individual Changes does not prove the integrated Outcome\./);
  });

  it("is owned by Project as registered KAAL content, persistence apart", () => {
    assert.match(text("Project-Plan.md"), /Project defines and owns its Project Plans as registered KAAL content; how they are persisted is separate from who owns them\./);
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
