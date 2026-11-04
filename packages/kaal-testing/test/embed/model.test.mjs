// kaal-testing's embedded cases for the Testing model (testing/F24–testing/F33, testing/F40–testing/F42). They
// reach the installed package by its name and decide each requirement from behaviour, never from a file.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { check, current, evaluate, results, tested } from "kaal-testing/model";

const MODEL = {
  plans: [{ id: "acme/P1", suites: ["acme/S1"] }],
  suites: [{ id: "acme/S1", cases: ["acme/T1", "acme/T2"] }],
  cases: [
    { id: "acme/T1", version: "1", tests: ["acme/F1"] },
    { id: "acme/T2", version: "1", tests: ["acme/F1", "acme/D1"] },
  ],
};
const run = (outcomes, provenance = { "acme/P1": null, "acme/S1": null, "acme/T1": "1", "acme/T2": "1" }) => ({ id: "r", of: "acme/P1", provenance, outcomes, data: {} });

describe("The Testing model", () => {
  it("checks a model as given and finds what is malformed [testing/F24, testing/F25]", () => {
    assert.deepEqual(check(MODEL), []);
    assert.ok(check({ cases: [{ id: "acme/T1", tests: ["acme/F1"] }, { id: "acme/T1", tests: ["acme/F1"] }] }).length > 0, "a duplicate identity is a finding");
    assert.ok(check({ suites: [{ id: "acme/S1", cases: ["acme/T9"] }] }).length > 0, "a reference to an undeclared Case is a finding");
  });

  it("derives which Cases test each target from the Cases' own traces [testing/F25]", () => {
    assert.deepEqual(tested(MODEL), { "acme/F1": ["acme/T1", "acme/T2"], "acme/D1": ["acme/T2"] });
  });

  it("gives each Case's result in one Run as observed, and a Case that did not run is unknown [testing/F26]", () => {
    const r = results(MODEL, run({ "acme/T1": "passed" }));
    assert.equal(r.cases["acme/T1"], "passed");
    assert.equal(r.cases["acme/T2"], "unknown");
    assert.equal(r.suites["acme/S1"], "unknown", "so its Suite is unknown [testing/F27]");
  });

  it("evaluates a Plan Run: failed when a Case failed, passed only when every Case passed [testing/F27, testing/F28]", () => {
    assert.equal(evaluate(MODEL, run({ "acme/T1": "passed", "acme/T2": "failed" })).result, "failed");
    assert.equal(evaluate(MODEL, run({ "acme/T1": "passed", "acme/T2": "passed" })).result, "passed");
  });

  it("reads current evidenced quality from the latest applicable Run, never an older one [testing/F40, testing/F41]", () => {
    const older = { ...run({ "acme/T1": "passed", "acme/T2": "passed" }), id: "r1" };
    const latest = { ...run({ "acme/T1": "passed", "acme/T2": "failed" }), id: "r2" };
    assert.equal(current(MODEL, [older, latest], "acme/P1").result, "failed");
    const changed = { ...MODEL, cases: MODEL.cases.map((c) => (c.id === "acme/T2" ? { ...c, version: "2" } : c)) };
    assert.equal(current(changed, [older], "acme/P1").result, "unknown", "a Run of an earlier version no longer stands");
  });
});
