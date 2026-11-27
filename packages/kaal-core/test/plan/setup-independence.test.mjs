// core/C162 planned outer tests: setup independence. Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/setup-independence/*.md). They
// check the verdict the judge returns for a declared manifest, never the
// wording of the Definition.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as installation from "kaal-core/installation";

const FOUNDATION = "@kaihacksai/kaal-foundation";
const HOSTING = "@kaihacksai/kaal-hosting";

/** The judge, or the reason a test is blocked before any behavioural assertion. */
function judge() {
  if (typeof installation.judgeSetupIndependence !== "function") assert.fail("blocked before behavioural assertion: kaal-core/installation exports no judgeSetupIndependence");
  return installation.judgeSetupIndependence;
}
const where = (verdict) => verdict.findings.map((f) => [f.field, f.name]);

describe("Setup independence (core/C162)", () => {
  it("core/T129 [core/F121, core/F122, core/A65]: a package naming only the permitted shared packages and non-KAAL packages is independent, whatever its devDependencies hold", () => {
    const j = judge();
    const v = j({ name: "kaal-sample", dependencies: { [FOUNDATION]: "0.0.1", [HOSTING]: "0.0.1", yaml: "2.9.1" }, devDependencies: { "kaal-testing": "0.0.1", "kaal-core": "0.0.1" } });
    assert.equal(v.verdict, "independent");
    assert.deepEqual(v.findings, []);
    assert.equal(j({ name: "kaal-bare" }).verdict, "independent", "a package that declares no dependency at all is independent");
  });

  it("core/T130 [core/F122, core/A65]: a KAAL package in dependencies, optionalDependencies, bundleDependencies or a non-optional peer is a finding naming field and package; an optional peer is not; the caller's permitted replaces the default", () => {
    const j = judge();
    const manifest = {
      name: "kaal-sample",
      dependencies: { [FOUNDATION]: "0.0.1", "kaal-graph": "0.0.1" },
      optionalDependencies: { "@kaihacksai/kaal-testing": "0.0.1" },
      bundleDependencies: ["kaal-review"],
      peerDependencies: { "kaal-core": "0.0.1", "kaal-controls": "0.0.1" },
      peerDependenciesMeta: { "kaal-controls": { optional: true } },
    };
    const v = j(manifest);
    assert.equal(v.verdict, "dependent");
    assert.deepEqual(where(v).sort(), [
      ["bundleDependencies", "kaal-review"],
      ["dependencies", "kaal-graph"],
      ["optionalDependencies", "@kaihacksai/kaal-testing"],
      ["peerDependencies", "kaal-core"],
    ].sort());
    const allowed = j(manifest, { permitted: [FOUNDATION, "kaal-graph", "@kaihacksai/kaal-testing", "kaal-review", "kaal-core"] });
    assert.equal(allowed.verdict, "independent");
    const replaced = j({ name: "kaal-sample", dependencies: { [HOSTING]: "0.0.1" } }, { permitted: [FOUNDATION] });
    assert.deepEqual(where(replaced), [["dependencies", HOSTING]], "a caller's permitted replaces the default, so Hosting is no longer permitted");
  });

  it("core/T131 [core/N32, core/F122, core/A65]: a manifest that is missing, not an object, or whose dependency fields are not the shape they should be is unknown, never independent", () => {
    const j = judge();
    for (const bad of [undefined, null, "kaal-sample", 7, [], { name: "kaal-sample", dependencies: ["kaal-graph"] }, { name: "kaal-sample", dependencies: "kaal-graph" }, { name: "kaal-sample", bundleDependencies: { a: 1 } }, { name: "kaal-sample", peerDependencies: null }]) {
      const v = j(bad);
      assert.equal(v.verdict, "unknown", `${JSON.stringify(bad)} is unknown`);
      assert.notEqual(v.verdict, "independent");
    }
  });
});
