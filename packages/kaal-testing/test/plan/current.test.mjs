// testing/C27 planned outer tests: current evidenced quality from a consumer's retained Runs.
// Immutable to DO and CHECK; testing/C28 turns them GREEN. Each title names the contracts
// it checks (plan/model/*.md, testing/C27's amendment). They use kaal-testing's public
// interface only, on models and Runs given as plain data.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-testing/model's current, or the reason the tests are blocked before any behavioural assertion. */
async function model() {
  let m;
  try {
    m = await import("kaal-testing/model");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./model (${e.code ?? e.message})`);
  }
  if (typeof m.current !== "function") assert.fail("blocked before behavioural assertion: kaal-testing/model exports no current");
  return m;
}

/** One Plan over one Suite of two Cases; the Plan defines versioned Test Data. */
const MODEL = (v = { P: "1", c: "1", D: "d1" }) => ({
  plans: [{ id: "P", version: v.P, suites: ["S"], data: [{ id: "D", version: v.D, external: "s3://anywhere/d.csv" }] }],
  suites: [{ id: "S", cases: ["c", "d"] }],
  cases: [{ id: "c", version: v.c }, { id: "d" }],
});
/** A Plan Run with the given outcomes, recording the given versions. */
const run = (id, outcomes, v = { P: "1", c: "1", D: "d1" }) => ({
  id,
  of: "P",
  provenance: { P: v.P, S: null, c: v.c, d: null },
  outcomes: {},
  data: { D: v.D },
  runs: [{ id: `${id}/S`, of: "S", outcomes }],
});
const GREEN = { c: "passed", d: "passed" };

describe("Current evidenced quality (testing/C27)", () => {
  it("testing/T50 [testing/F40]: the latest applicable Run, in the consumer's order, is the current evidence; an older Run never stands in for it, and Testing reads no clock", async () => {
    const { current } = await model();
    const now = current(MODEL(), [run("r1", { c: "failed", d: "passed" }), run("r2", GREEN)], "P");
    assert.deepEqual([now.run, now.result], ["r2", "passed"]);
    const regressed = current(MODEL(), [run("r1", GREEN), run("r2", { c: "failed", d: "passed" })], "P");
    assert.deepEqual([regressed.run, regressed.result], ["r2", "failed"], "a later failure is the current quality, whatever passed before");
    const stamped = [{ ...run("late", GREEN), at: "2099-01-01" }, run("early", { c: "failed", d: "passed" })];
    assert.equal(current(MODEL(), stamped, "P").run, "early", "order is the consumer's; a timestamp the Run carries is not Testing's to compare");
    assert.equal(current(MODEL(), stamped, "P").result, "failed");
  });

  it("testing/T51 [testing/F40, testing/F41]: applicability follows the definitions, versions and Test Data the model now declares; a Run of another element or version is disclosed as inapplicable, never counted", async () => {
    const { current } = await model();
    const older = run("r1", GREEN);
    const changed = MODEL({ P: "1", c: "2", D: "d1" });
    const now = current(changed, [older], "P");
    assert.deepEqual([now.run, now.result], [null, "unknown"], "a Run of c at 1 shows nothing about c at 2");
    assert.equal(now.runs[0].applicable, false);
    assert.ok(now.runs[0].differences.some((d) => d.includes("c") && d.includes("2")), "the difference names the definition and its version");
    const data = current(MODEL({ P: "1", c: "1", D: "d2" }), [older], "P");
    assert.equal(data.result, "unknown", "a Run on other Test Data is not current evidence");
    assert.ok(data.runs[0].differences.some((d) => d.includes("D")));
    const mixed = current(changed, [run("r2", GREEN, { P: "1", c: "2", D: "d1" }), older], "P");
    assert.deepEqual([mixed.run, mixed.result], ["r2", "passed"], "an inapplicable later Run is skipped, and disclosed");
    assert.deepEqual(mixed.runs.map((r) => [r.run, r.applicable]), [["r2", true], ["r1", false]]);
    const stale = { ...run("r2", GREEN), runs: [{ id: "r2/S", of: "S", provenance: { c: "0" }, outcomes: GREEN }] };
    const inner = current(MODEL(), [older, stale], "P");
    assert.deepEqual([inner.run, inner.result], ["r1", "passed"], "an encompassed Run that executed another version makes its Run inapplicable");
    assert.ok(inner.runs[1].differences.some((d) => d.includes("c") && d.includes("0")));
    const suiteRun = { id: "s1", of: "S", provenance: { S: null, c: "1", d: null }, outcomes: GREEN };
    assert.deepEqual(current(MODEL(), [run("r1", GREEN), suiteRun], "P").run, "r1", "a Run of another element is not the Plan's evidence");
    assert.deepEqual([current(MODEL(), [run("r1", { c: "failed", d: "passed" }), suiteRun], "S").run, current(MODEL(), [suiteRun], "S").result], ["s1", "passed"]);
  });

  it("testing/T52 [testing/F41]: an incomplete, unknown or invalid latest applicable Run makes the current quality unknown; it never falls back to an older GREEN", async () => {
    const { current } = await model();
    const green = run("r1", GREEN);
    const latest = {
      "incomplete": run("r2", { c: "passed" }),
      "skipped": run("r2", { c: "passed", d: "skipped" }),
      "invalid": { ...run("r2", GREEN), data: { D: "d1", ghost: null } },
      "malformed": { ...run("r2", GREEN), outcomes: [] },
      "unreadable": null,
      "without an element": { ...run("r2", GREEN), of: undefined },
    };
    for (const [why, r2] of Object.entries(latest)) {
      const now = current(MODEL(), [green, r2], "P");
      assert.equal(now.result, "unknown", why);
      assert.notEqual(now.run, "r1", `${why}: the older GREEN does not stand in`);
    }
    assert.ok(current(MODEL(), [green, null], "P").findings.length > 0, "a Run that does not read is a finding");
    const suite = { id: "s1", of: "S", provenance: { S: null, c: "1", d: null }, outcomes: GREEN };
    assert.equal(current(MODEL(), [suite], "S").result, "passed");
    assert.equal(current(MODEL(), [suite, { ...suite, id: "s2", data: { ghost: null } }], "S").result, "unknown", "a Suite's latest Run with a finding is unknown, though its Cases passed");
  });

  it("testing/T53 [testing/F42]: retention is the consumer's: zero, one or many Runs are accepted as given, nothing is kept between calls, and with none retained the current quality is unknown", async () => {
    const { current } = await model();
    const none = current(MODEL(), [], "P");
    assert.deepEqual([none.run, none.result, none.runs], [null, "unknown", []]);
    const runs = [run("r1", GREEN)];
    const before = JSON.stringify(runs);
    assert.equal(current(MODEL(), runs, "P").result, "passed");
    assert.equal(JSON.stringify(runs), before, "the consumer's Runs are not changed");
    assert.equal(current(MODEL(), [], "P").result, "unknown", "nothing was kept from the last call");
    for (const bad of [undefined, null, {}, "r1", { 0: run("r1", GREEN) }]) assert.equal(current(MODEL(), bad, "P").result, "unknown", `runs ${typeof bad}`);
    assert.equal(current(MODEL(), [run("r1", { c: "failed", d: "passed" })], "P", { allowances: [{ case: "c", cite: "ticket 7" }] }).result, "passed", "a Plan's allowances apply to its current evaluation");
  });
});
