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
    const capability = node("Process.md");
    assert.equal(capability.name, "Process");
    assert.deepEqual(capability.type, foundation().capability);
  });

  it("declares what it provides and what admission requires", () => {
    assert.match(text("Process.md"), /^It provides the Process Definition and the PDCA Definition, which defines PDCA as a Process Template\. For admission it requires Core's KAAL Capability and KAAL Definition, and nothing else\.$/m);
  });

  it("states where its responsibility starts and ends, and leaves each process with its owner", () => {
    const capability = text("Process.md");
    assert.match(capability, /starts where a capability describes a way of working that repeats, and ends at the concepts used to describe it/);
    assert.match(capability, /Describing a process through the metamodel transfers none of that to Process\./);
    assert.match(capability, /a Change's lifecycle remains Change's/);
    assert.match(capability, /Process keeps no registry of processes/);
  });
});

describe("Process Templates", () => {
  it("are Process's to deliver, while each specific process and instance stays with its capability", () => {
    const capability = text("Process.md");
    assert.match(capability, /and for the management of processes through it\. Its scope is that alone: each specific process, and each instance of it, remains owned by the capability whose process it is\./);
    assert.match(capability, /A Process Template is a reusable process described through the metamodel, with generic phases and expectations, for any capability to adopt\. It is not an instantiated process of any capability and not a universal mandatory workflow/);
    assert.match(capability, /A capability that adopts a template owns its particular process: its adaptations, applicability, conditions, decisions and realization\./);
  });

  it("make PDCA a template, never an instantiated or mandatory process", () => {
    const definition = text("PDCA.md");
    assert.match(definition, /^As a template, PDCA is not an instantiated Change, Engineering or Learning process, and not a universal mandatory workflow\./m);
    assert.match(definition, /dictates none of the semantics of Testing, Change, Review, Learning or Engineering\. A capability that adopts it owns its particular process/);
    assert.match(readFileSync(join(PACKAGE, "README.md"), "utf8"), /PDCA is one: a template, not an instantiated Change, Engineering or Learning process and not a universal mandatory workflow\./);
  });
});

describe("the Process Definition", () => {
  it("is typed by Core's KAAL Definition and distinct from the Capability Node", () => {
    const definition = node("Process-Definition.md");
    assert.equal(definition.name, "Process");
    assert.deepEqual(definition.type, foundation().definition);
    assert.notEqual(definition.id, node("Process.md").id);
  });

  it("names the metamodel's concepts", () => {
    const definition = text("Process-Definition.md");
    for (const concept of ["Activity", "Role", "State and Transition", "Ordering", "Entry and Exit conditions"]) {
      assert.match(definition, new RegExp(`^- \\*\\*${concept}\\*\\*: `, "m"), concept);
    }
  });

  it("keeps a Role apart from the actor that fulfils it", () => {
    assert.match(text("Process-Definition.md"), /fulfilled by an actor: a human, a CASE Agent or another authorized participant\. A Role is not an Agent/);
  });

  it("derives a State from observable facts and assumes none", () => {
    const definition = text("Process-Definition.md");
    assert.match(definition, /A State is derived from observable facts and is never kept as a claim of its own\./);
    assert.match(definition, /a missing fact leaves the State undecided, never assumed/);
    assert.match(definition, /Which States exist and which Transitions are allowed belong to the Process's owner\./);
  });

  it("orders Activities in sequence, in parallel, without order, or as a loop", () => {
    assert.match(text("Process-Definition.md"), /in sequence, in parallel, as concerns with no order among them, or as a loop that repeats until its exit condition holds/);
  });

  it("authorizes nothing and makes nothing mandatory", () => {
    assert.match(text("Process-Definition.md"), /authorizes nothing and makes nothing mandatory/);
  });
});

describe("the PDCA Definition", () => {
  it("is typed by Core's KAAL Definition", () => {
    const definition = node("PDCA.md");
    assert.equal(definition.name, "PDCA");
    assert.deepEqual(definition.type, foundation().definition);
  });

  it("is a learning and improvement cycle of four Activities ordered as a loop", () => {
    const definition = text("PDCA.md");
    assert.match(definition, /^PDCA: Plan, Do, Check, Act\. PDCA is a Process Template, delivered by Process for any capability to adopt\. It is a learning and improvement cycle for a unit of work at any level: four Activities ordered as a loop\.$/m);
    for (const phase of ["Plan", "Do", "Check", "Act"]) {
      assert.match(definition, new RegExp(`^- \\*\\*${phase}\\*\\*: `, "m"), phase);
    }
  });

  it("fixes the outer acceptance boundary in Plan, before Do", () => {
    assert.match(text("PDCA.md"), /establish, before Do, what the work is to achieve and how its achievement will be judged: .+ and its outer acceptance boundary, including the planned tests that protect it\./);
  });

  it("lets Do perform only the work actually needed, possibly no change", () => {
    assert.match(text("PDCA.md"), /perform only the work the plan actually needs: a change in behavior, documentation, tests and evidence, or no change at all where the planned condition is found to hold already\./);
  });

  it("presupposes no failure and never manufactures one", () => {
    const definition = text("PDCA.md");
    assert.match(definition, /^No phase presupposes a failure\./m);
    assert.match(definition, /does not imply that behavior must change: where it already holds, the cycle delivers the explicit obligation and new evidence for it\./);
    assert.match(definition, /A failure is found where it exists, never manufactured to fit the cycle\./);
  });

  it("lets Check state only what the result proves", () => {
    assert.match(text("PDCA.md"), /state what the result actually proves\. Check claims no universal correctness and does not by itself establish the intended Outcome\./);
  });

  it("lets Act preserve knowledge for a later Plan, by any fitting mechanism, and change nothing by itself", () => {
    const definition = text("PDCA.md");
    assert.match(definition, /preserve the knowledge the completed cycle gave, so that a later Plan can retrieve and use it/);
    assert.match(definition, /Act may use whatever learning, adaptation or improvement mechanism fits its context, a retrospective among them\./);
    assert.match(definition, /^Act changes nothing by itself\. An observation or candidate lesson becomes no rule, backlog item or Change on its own, and any substantive modification needs its own authorization\.$/m);
  });

  it("is recursive, and an inner cycle never substitutes for the enclosing Check", () => {
    const definition = text("PDCA.md");
    assert.match(definition, /^PDCA is recursive\./m);
    assert.match(definition, /An inner cycle contributes its results and evidence to the enclosing Check and never substitutes for it/);
    assert.match(definition, /does not accept the enclosing outcome/);
  });

  it("is realized by Changes and increments, and owned by no branch or pull request", () => {
    const definition = text("PDCA.md");
    assert.match(definition, /not a workflow of branches or pull requests/);
    assert.match(definition, /branches, pull requests, reviews and CI supply facts about it and own none of it/);
  });

  it("keeps Plan apart from Product's PLAN", () => {
    assert.match(text("PDCA.md"), /Plan here is not Product's PLAN/);
  });

  it("leaves each concern with its owner and makes nothing mandatory", () => {
    const definition = text("PDCA.md");
    assert.match(definition, /What a Plan contains belongs to the concern it is about\./);
    assert.match(definition, /Tests, evidence and what a test proves are Testing's/);
    assert.match(definition, /a Change's authorization and lifecycle are Change's; retrospectives and retrievable learning are Learning's/);
    assert.match(definition, /Describing work as PDCA makes nothing mandatory/);
  });
});

describe("admission", () => {
  it("is admitted as a Capability by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-process-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "process", await readContribution(CAPABILITY));
    assert.deepEqual(r.ids, [node("Process.md").id]);
    assert.deepEqual((await catalog(engine)).capabilities, [{ name: "Process", id: node("Process.md").id }]);
    assert.equal((await verify(engine)).ok, true);
  });
});

describe("Process's own claim", () => {
  it("names the Capability Node by its kind and exact name and id, and claims Process's tree", () => {
    const capability = node("Process.md");
    const { claim, finding } = readClaim(`packages/skills/kaal-process/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", name: capability.name, id: capability.id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-process/"]);
  });
});

describe("the README", () => {
  const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");

  it("lists each shipped Node's exact id, so a consumer can verify the bytes", () => {
    for (const file of ["Process.md", "Process-Definition.md", "PDCA.md"]) {
      assert.match(readme, new RegExp(`^${node(file).id}  capability/${file.replace(".", "\\.")} `, "m"), file);
    }
  });

  it("states that assurance is the publisher's and promises no consumer-run tests", () => {
    assert.match(readme, /It promises no tests a consumer runs\. Its assurance is the publisher's/);
  });

  it("keeps other capabilities' roles theirs", () => {
    assert.match(readme, /Process neither defines them nor maps them onto its Role\./);
  });
});

describe("the package", () => {
  it("packs its Nodes and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/PDCA.md",
      "capability/Process-Definition.md",
      "capability/Process.md",
      "package.json",
    ]);
  });
});
