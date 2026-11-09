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
import { execute } from "@kaihacksai/kaal-hosting";
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
    assert.match(text("Product.md"), /^It provides the Product Direction Definition, the PLAN Definition, the Owner View Definition and the Decision Preparation Definition\. For admission it requires Core's KAAL Capability and KAAL Definition, and nothing else\.$/m);
  });

  it("states where its responsibility starts and ends", () => {
    assert.match(text("Product.md"), /starts where the Product Owner gives direction or an Intent asks for an increment, and ends when an increment has been selected and ordered/);
  });

  it("leaves every decision with the Product Owner", () => {
    assert.match(text("Product.md"), /The Product Owner decides; Product prepares each decision and records the choice as it was made, and decides nothing itself\./);
  });

  it("leaves Intent, Change and Project their own responsibilities and objects", () => {
    const capability = text("Product.md");
    assert.match(capability, /What an Intent means and what its Outcome is are Intent's\./);
    assert.match(capability, /its own lifecycle, which is Change's; coordinating several related Changes is Project's/);
    assert.match(capability, /Each of these capabilities defines and owns its own objects and their lifecycle, and a relationship between capabilities transfers no ownership\./);
  });

  it("defines and owns its Product Direction objects as registered KAAL content", () => {
    const capability = text("Product.md");
    assert.match(capability, /Product defines and owns its Product Direction objects: wanted increments, the backlog, the roadmap, priorities and decision preparations\. The Product Owner retains decision authority over them\./);
    assert.match(capability, /canonical, registered KAAL content, associated with the business entity that owns them, not loose documents and not a duplicate store of GitHub issues or pull requests/);
  });

  it("keeps persistence apart from ownership", () => {
    assert.match(text("Product.md"), /Product needs no storage subsystem of its own: how its objects are persisted is separate from who owns them\./);
    assert.match(text("Product-Direction.md"), /how they are persisted does not decide who owns them/);
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

  it("is owned by Product, with decision authority left to the Product Owner", () => {
    assert.match(text("Product-Direction.md"), /^Product defines and owns these objects, and the Product Owner retains decision authority over them\./m);
  });
});

describe("the PLAN Definition", () => {
  it("is typed by Core's KAAL Definition", () => {
    const definition = node("PLAN.md");
    assert.equal(definition.name, "PLAN");
    assert.deepEqual(definition.type, foundation().definition);
  });

  it("turns the backlog into a roadmap", () => {
    assert.match(text("PLAN.md"), /^PLAN is how Product turns possible work into an intentional roadmap: Backlog → PLAN → Roadmap\.$/m);
  });

  it("names its four words", () => {
    const definition = text("PLAN.md");
    for (const word of ["Prioritize", "Launch", "Adaption", "Now"]) {
      assert.match(definition, new RegExp(`^- \\*\\*${word}\\*\\*: `, "m"), word);
    }
  });

  it("authorizes an increment at Launch without delivering it", () => {
    assert.match(text("PLAN.md"), /Launching does not deliver the increment, and Product does not take over its delivery\./);
  });

  it("reflects unplanned work by adapting the plan", () => {
    assert.match(text("PLAN.md"), /even a single unplanned Change, is reflected by adapting the plan; it is not an exception that bypasses product direction/);
  });

  it("is not a pipeline, a ceremony or a Project", () => {
    assert.match(text("PLAN.md"), /PLAN is not a pipeline of four steps, a ceremony or a Project\./);
  });

  it("leaves authority with the Product Owner", () => {
    const definition = text("PLAN.md");
    assert.match(definition, /Product prepares and maintains the backlog and roadmap\./);
    assert.match(definition, /The Product Owner retains authority over priorities, authorization of increments and substantive changes to product direction\./);
  });

  it("is not the Plan phase of Plan–Do–Check–Act", () => {
    assert.match(text("PLAN.md"), /PLAN is not the Plan phase of Plan–Do–Check–Act/);
  });
});

describe("the Owner View Definition", () => {
  it("is typed by Core's KAAL Definition", () => {
    const definition = node("Owner-View.md");
    assert.equal(definition.name, "Owner View");
    assert.deepEqual(definition.type, foundation().definition);
  });

  it("shows, for each wanted increment, its Intent, Requirements, place, decisions and readiness", () => {
    const definition = text("Owner-View.md");
    for (const item of ["Intent", "Requirements", "Place", "Decisions", "Readiness"]) {
      assert.match(definition, new RegExp(`^- \\*\\*${item}\\*\\*: `, "m"), item);
    }
  });

  it("reuses Testing's and Graph's evidence and adds no second model", () => {
    const definition = text("Owner-View.md");
    assert.match(definition, /Test Case traces across the loops \(Intent, Requirements, Architecture and Defects\) are Testing's, and trace and reach semantics are Graph's\./);
    assert.match(definition, /it adds no second traceability model, no verifier and no consumer content, and it does not re-run or re-judge verification/);
  });

  it("is kept per product, the repository and each npm package being products with their own PDCA", () => {
    const definition = text("Owner-View.md");
    assert.match(definition, /The Owner View is kept per product\. The KAAL repository is a product, and each independently managed npm package is a product in its own right, each with its own product PDCA/);
    assert.match(definition, /npm publication is one step in a package's cycle, not all of it/);
  });

  it("leaves portfolio-level decisions to the portfolio concerns and defines neither", () => {
    assert.match(text("Owner-View.md"), /is portfolio-level and is not Product's: Product Portfolio Management \(products\) and Project Portfolio Management \(projects\) are separate concerns whose ownership is not decided here, and Product defines neither\./);
  });

  it("models activity per Change and derives a capability's availability from it", () => {
    const definition = text("Owner-View.md");
    assert.match(definition, /Activity is modelled per Change \(per pull request\), and a capability's availability is derived from its Changes\. It is not a single state of the capability/);
    for (const state of ["Working", "Waiting", "Blocked", "Planned"]) {
      assert.match(definition, new RegExp(`^\\d\\. \\*\\*${state}\\*\\*`, "m"), state);
    }
    assert.match(definition, /Working and Waiting can hold at the same time for different Changes of the same capability\./);
  });

  it("calls a capability blocked only when all its planned work is blocked, and separates no work planned", () => {
    const definition = text("Owner-View.md");
    assert.match(definition, /^- \*\*Blocked\*\*: the plan holds planned work and every possible Change in it is Blocked\. One blocked pull request does not make the capability blocked\./m);
    assert.match(definition, /^- \*\*No work planned\*\*: .* This is not Blocked and is shown separately\./m);
    assert.match(definition, /^- \*\*Actionable\*\*: .*Waiting Changes do not make the capability unavailable\./m);
  });

  it("leaves the decision with the Product Owner and delivery with Engineering", () => {
    assert.match(text("Owner-View.md"), /The Product Owner decides\. Product prepares each decision, and Engineering retains delivery responsibility\./);
  });
});

describe("the Decision Preparation Definition", () => {
  it("is typed by Core's KAAL Definition", () => {
    const definition = node("Decision-Preparation.md");
    assert.equal(definition.name, "Decision Preparation");
    assert.deepEqual(definition.type, foundation().definition);
  });

  it("names the parts of a preparation", () => {
    const definition = text("Decision-Preparation.md");
    for (const part of ["Question", "Options", "Evidence", "Recommendation", "Decider", "Recorded choice", "Hand-over"]) {
      assert.match(definition, new RegExp(`^- \\*\\*${part}\\*\\*: `, "m"), part);
    }
  });

  it("puts at least two outcomes to the Decider without manufacturing alternatives", () => {
    const definition = text("Decision-Preparation.md");
    assert.match(definition, /Either at least two Options, or, when the genuine decision is a single proposal, accept and reject: two outcomes, with no alternative manufactured to make up the number\./);
    assert.match(definition, /each stating what choosing it would mean/);
  });

  it("refers to evidence and does not copy or re-judge it", () => {
    assert.match(text("Decision-Preparation.md"), /refers to the Owner View's readiness and evidence and does not copy, re-run or re-judge it/);
  });

  it("makes a recommendation advice only and decides nothing", () => {
    const definition = text("Decision-Preparation.md");
    assert.match(definition, /A Recommendation is advice, never the decision\./);
    assert.match(definition, /Preparing a decision decides nothing, and no priority, order or authorization is valid until the Decider has given it\./);
  });

  it("records the choice as the Decider made it, and a preparation moves Prepared, Decided or Withdrawn", () => {
    const definition = text("Decision-Preparation.md");
    assert.match(definition, /records the chosen Option, who decided and when, and the reason as given, exactly as the Decider made it/);
    for (const state of ["Prepared", "Decided", "Withdrawn"]) {
      assert.match(definition, new RegExp(`^\\d\\. \\*\\*${state}\\*\\*`, "m"), state);
    }
  });

  it("hands a selected increment over without delivering it", () => {
    assert.match(text("Decision-Preparation.md"), /Hand-over\*\*: when the choice selects or prioritizes an increment, the hand-over to Change.* Product does not deliver it\./);
  });

  it("does not treat selecting or prioritizing an increment as authorizing a governed action", () => {
    const definition = text("Decision-Preparation.md");
    assert.match(definition, /Selecting or prioritizing an increment is a product choice and is not itself the authorization of a governed action/);
    assert.match(definition, /engineering work, promotion, npm publication, a new package or capability each need the separate authorization that governs them, and a Recorded choice neither grants nor implies one/);
    assert.doesNotMatch(definition, /Selecting authorizes the increment/);
  });

  it("leaves technical decisions to Engineering", () => {
    assert.match(text("Decision-Preparation.md"), /Technical decisions are Engineering's and are not prepared here\./);
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
      "capability/Decision-Preparation.md",
      "capability/Owner-View.md",
      "capability/PLAN.md",
      "capability/Product-Direction.md",
      "capability/Product.md",
      "package.json",
    ]);
  });
});
