// Capability acceptance: use the caller-packed bytes in a fresh installation.
import assert from "node:assert/strict";
import { it } from "node:test";
import { execute } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";

it("the installed timing and redesign exports keep faster timing separate from preserved discrimination", async () => {
  const host = await install(["kaal-testing", "kaal-hosting"]);
  const script = `
    import assert from "node:assert/strict";
    import { profile, skew } from "kaal-testing/timing";
    import { candidates, refactored } from "kaal-testing/redesign";
    const v1 = "1".repeat(64), v2 = "2".repeat(64);
    const run = (version, ms) => ({ platform: "host", cases: [
      ...Array.from({ length: 5 }, (_, i) => ({ name: "quick " + i, sha256: v1, ms: 100 })),
      { name: "slow", sha256: version, ms }
    ] });
    assert.equal(profile(run(v1, 9000)).result, "challenged");
    const skewed = skew([{ ...run(v1, 3000), platform: "a" }, { ...run(v1, 41000), platform: "b" }]);
    assert.equal(skewed.challenges[0].owner, "case owner");
    const history = [...Array.from({ length: 3 }, () => run(v1, 9000)), ...Array.from({ length: 3 }, () => run(v2, 100))];
    const timing = candidates(history).refactors.find((r) => r.case === "slow");
    const before = { id: "slow", version: v1, tests: ["F1"], verdicts: { candidate: "pass", mutant: "fail" } };
    const after = { ...before, version: v2, verdicts: { candidate: "pass", mutant: "pass" } };
    assert.deepEqual([timing.shown, refactored(before, after).result], ["faster", "changed"]);
    assert.equal(candidates(null).result, "unknown");
    assert.equal(refactored(before, { ...after, verdicts: { candidate: "skipped" } }).result, "unknown");
    console.log("installed timing/redesign assertions passed");
  `;
  const r = await execute(process.execPath, ["--input-type=module", "-e", script], { cwd: host });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /installed timing\/redesign assertions passed/);
});
