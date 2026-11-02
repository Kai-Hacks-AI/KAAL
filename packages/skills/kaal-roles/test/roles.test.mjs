// Deterministic verification of what can be decided mechanically: the Nodes'
// Form and type, admission into an Engine, the ownership claim, what the
// package delivers, and the key statements as written.
// Whether the Roles say the right thing is validation, by independent Agent
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
    const capability = node("Roles.md");
    assert.equal(capability.name, "Roles");
    assert.deepEqual(capability.type, foundation().capability);
  });

  it("declares what it provides and what admission requires, and no Process dependency", () => {
    const capability = text("Roles.md");
    assert.match(capability, /^It provides the CTO Advisor Definition and the CPO Advisor Definition\. For admission it requires Core's KAAL Capability and KAAL Definition, and nothing else\. It declares no dependency on Process\.$/m);
  });

  it("is provisional, with Engineering and Product as eventual owners", () => {
    const capability = text("Roles.md");
    assert.match(capability, /incubation arrangement, not a precedent that future Roles are centrally owned/);
    assert.match(capability, /The eventual semantic owner of the CTO Advisor is Engineering, and of the CPO Advisor is Product\./);
  });

  it("states the capability-owned Roles principle without a registry", () => {
    const capability = text("Roles.md");
    assert.match(capability, /each Capability defines and owns the Roles it needs to perform its responsibilities/);
    assert.match(capability, /Roles creates no parallel registry\. A Role's availability grants no authority\./);
  });
});

for (const [file, name, owner] of [
  ["CTO-Advisor.md", "CTO Advisor", "Engineering"],
  ["CPO-Advisor.md", "CPO Advisor", "Product"],
]) {
  describe(`the ${name} Definition`, () => {
    it("is typed by Core's KAAL Definition", () => {
      const definition = node(file);
      assert.equal(definition.name, name);
      assert.deepEqual(definition.type, foundation().definition);
    });

    it("is a Role, not an Agent, and grants no authority", () => {
      const definition = text(file);
      assert.match(definition, /It is not an Agent, and it fixes no identity\./);
      assert.match(definition, /Having this Role grants no authority\./);
    });

    it(`is provisional, with ${owner} as its eventual owner`, () => {
      assert.match(text(file), new RegExp(`This definition is provisional\\. Its eventual semantic owner is ${owner}`));
    });

    it("states applicability, competence, authority limits and escalation", () => {
      const definition = text(file);
      for (const field of ["Applicability", "Responsibility", "Lens", "Required competence", "May decide", "May recommend", "May not decide", "Independence", "Escalation"]) {
        assert.match(definition, new RegExp(`^- \\*\\*${field}\\*\\*: `, "m"), field);
      }
    });

    it("covers PLAN, DO, SYNC and promotion PRs, not promotion alone", () => {
      assert.match(text(file), /the PLAN, DO, SYNC and promotion PRs/);
      assert.match(text(file), /Promotion is an important joint checkpoint, not the only place the Role applies\./);
    });

    it("keeps a review outcome apart from an Owner decision", () => {
      const definition = text(file);
      assert.match(definition, /formal APPROVED PR review within its responsibility when instructed/);
      assert.match(definition, /never authorizes or implies SYNC, promotion, merge or publish, which remain Owner decisions wherever separately required/);
    });

    it("leaves a disagreement with the Owner, and neither Advisor overrides the other", () => {
      const definition = text(file);
      assert.match(definition, /the Owner decides\. Neither Advisor overrides the other\./);
    });
  });
}

describe("admission", () => {
  it("is admitted as a Capability by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-roles-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "capability", "roles", await readContribution(CAPABILITY));
    assert.deepEqual(r.ids, [node("Roles.md").id]);
    assert.deepEqual((await catalog(engine)).capabilities, [{ name: "Roles", id: node("Roles.md").id }]);
    assert.equal((await verify(engine)).ok, true);
  });
});

describe("Roles' own claim", () => {
  it("names the Capability Node by its kind and exact name and id, and claims Roles' tree", () => {
    const capability = node("Roles.md");
    const { claim, finding } = readClaim(`packages/skills/kaal-roles/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", name: capability.name, id: capability.id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-roles/"]);
  });
});

describe("the package", () => {
  it("is private and packs its Nodes and nothing else beyond its metadata", async () => {
    assert.equal(JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).private, true);
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/CPO-Advisor.md",
      "capability/CTO-Advisor.md",
      "capability/Roles.md",
      "package.json",
    ]);
  });
});
