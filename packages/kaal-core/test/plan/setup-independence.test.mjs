// core/C162 planned outer tests: setup independence (declared, demonstrated, accepted). Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/setup-independence/*.md). They
// check the verdict the judge returns for a declared manifest, never the
// wording of the Definition.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as core from "kaal-core";
import * as installation from "kaal-core/installation";
import { identify } from "kaal-graph";

const FOUNDATION = "@kaihacksai/kaal-foundation";
const HOSTING = "@kaihacksai/kaal-hosting";

/** The judge, or the reason a test is blocked before any behavioural assertion. */
function judge() {
  if (typeof installation.judgeSetupIndependence !== "function") assert.fail("blocked before behavioural assertion: kaal-core/installation exports no judgeSetupIndependence");
  return installation.judgeSetupIndependence;
}
const where = (verdict) => verdict.findings.map((f) => [f.field, f.name]);

describe("Setup independence (core/C162)", () => {
  it("core/T129 [core/F121, core/F122, core/F123, core/A65]: a package naming only Foundation, Hosting and non-KAAL packages is declared independent, whatever its devDependencies hold, and its demonstrated verdict is unknown", () => {
    const j = judge();
    const v = j({ name: "kaal-sample", dependencies: { [FOUNDATION]: "0.0.1", [HOSTING]: "0.0.1", yaml: "2.9.1" }, devDependencies: { "kaal-testing": "0.0.1", "kaal-core": "0.0.1" } });
    assert.equal(v.declared, "independent");
    assert.deepEqual(v.findings, []);
    assert.equal(v.demonstrated, "unknown", "Core runs nothing, so it never reports a demonstration");
    const bare = j({ name: "kaal-bare" });
    assert.equal(bare.declared, "independent", "a package that declares no dependency at all is declared independent");
    assert.equal(bare.demonstrated, "unknown");
  });

  it("core/T130 [core/F122, core/A65]: a KAAL package in dependencies, optionalDependencies, bundleDependencies or a non-optional peer is a finding naming field and package; an optional peer is not", () => {
    const j = judge();
    const v = j({
      name: "kaal-sample",
      dependencies: { [FOUNDATION]: "0.0.1", "kaal-graph": "0.0.1" },
      optionalDependencies: { "@kaihacksai/kaal-testing": "0.0.1" },
      bundleDependencies: ["kaal-review"],
      peerDependencies: { "kaal-core": "0.0.1", "kaal-controls": "0.0.1" },
      peerDependenciesMeta: { "kaal-controls": { optional: true } },
    });
    assert.equal(v.declared, "dependent");
    assert.deepEqual(where(v).sort(), [
      ["bundleDependencies", "kaal-review"],
      ["dependencies", "kaal-graph"],
      ["optionalDependencies", "@kaihacksai/kaal-testing"],
      ["peerDependencies", "kaal-core"],
    ].sort());
    assert.equal(v.acceptable, false, "with nothing accepted, a dependent package is not acceptable");
  });

  it("core/T131 [core/N32, core/F122, core/A65]: a manifest that is missing, not an object, or whose dependency fields are not the shape they should be is unknown, never independent", () => {
    const j = judge();
    for (const bad of [undefined, null, "kaal-sample", 7, [], { name: "kaal-sample", dependencies: ["kaal-graph"] }, { name: "kaal-sample", dependencies: "kaal-graph" }, { name: "kaal-sample", bundleDependencies: { a: 1 } }, { name: "kaal-sample", peerDependencies: null }]) {
      const v = j(bad);
      assert.equal(v.declared, "unknown", `${JSON.stringify(bad)} is unknown`);
      assert.equal(v.demonstrated, "unknown");
      assert.equal(v.acceptable, false, "an unknown verdict is never acceptable");
    }
    assert.equal(j(null, { accepted: ["kaal-graph"] }).acceptable, false, "an acceptance never makes an unknown verdict acceptable");
  });

  it("core/T132 [core/F124, core/F122, core/A65]: an accepted dependency marks its finding accepted and makes the setup acceptable, and the package stays declared dependent; an acceptance of another package changes nothing; Hosting is not removable from the shared set", () => {
    const j = judge();
    const manifest = { name: "kaal-sample", dependencies: { [HOSTING]: "0.0.1", "kaal-core": "0.0.1", "kaal-graph": "0.0.1" } };
    const some = j(manifest, { accepted: ["kaal-core"] });
    assert.equal(some.declared, "dependent");
    assert.equal(some.acceptable, false, "one of two dependencies accepted is not enough");
    assert.deepEqual(some.findings.map((f) => [f.name, f.accepted]).sort(), [["kaal-core", true], ["kaal-graph", false]]);
    const all = j(manifest, { accepted: ["kaal-core", "kaal-graph"] });
    assert.equal(all.declared, "dependent", "an accepted dependency leaves the package declared dependent");
    assert.equal(all.acceptable, true, "the setup is acceptable when every finding is accepted");
    assert.equal(all.demonstrated, "unknown");
    const other = j(manifest, { accepted: ["kaal-review"] });
    assert.equal(other.acceptable, false, "accepting a package the manifest does not name changes nothing");
    const shared = j({ name: "kaal-sample", dependencies: { [HOSTING]: "0.0.1" } }, { accepted: [] });
    assert.equal(shared.declared, "independent", "Hosting stays in the shared set whatever the caller passes");
  });

  it("core/T133 [core/F121, core/A64]: the payload carries a Setup Independence Definition typed by KAAL Definition, it is admitted, and installationFormat() still names the carried Installation Contract by its exact bytes", () => {
    const files = core.payload();
    const bytes = files["core/Setup-Independence.md"];
    if (!bytes) assert.fail("blocked before behavioural assertion: the payload carries no core/Setup-Independence.md");
    const id = identify(bytes);
    assert.equal(id.name, "Setup Independence");
    assert.deepEqual(id.type, core.foundation().definition, "typed by KAAL Definition");
    const engine = core.evaluate(files);
    assert.deepEqual(engine.rejected, [], "nothing in the payload is rejected");
    assert.ok(engine.nodes.some((n) => n.name === "Setup Independence" && n.id === id.id), "the Definition is admitted");
    assert.equal(installation.installationFormat().id, identify(files["core/Installation-Contract.md"]).id, "the Installation Contract Definition is the one its format names");
  });
});
