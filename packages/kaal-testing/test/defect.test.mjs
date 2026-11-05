import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { check, state } from "kaal-testing/defect";

const rec = (over = {}) => ({ id: "c/D1", context: "c", expected: "e", observed: "o", where: "w", status: "reported", ...over });
const model = { plans: [{ id: "P", suites: ["S"] }], suites: [{ id: "S", cases: ["c/T1"] }], cases: [{ id: "c/T1", version: "1", tests: ["c/D1"] }] };
const run = (id, outcome) => ({ id, of: "P", provenance: { P: null, S: null, "c/T1": "1" }, outcomes: { "c/T1": outcome } });

describe("defect (implementation)", () => {
  it("shows reported when nothing confirms it, and confirmed or answered as the Runs allow", () => {
    assert.equal(state(rec(), { model, runs: [] }).shows, "reported");
    const confirmed = rec({ status: "confirmed", tests: ["c/T1"] });
    assert.equal(state(confirmed, { model, runs: [run("r1", "failed")] }).shows, "confirmed");
    const answered = rec({ status: "answered", tests: ["c/T1"] });
    const s = state(answered, { model, runs: [run("r1", "failed"), run("r2", "passed")] });
    assert.deepEqual(s, { shows: "answered", findings: [] });
  });

  it("finds a tested Case the model does not have, and non-list evidence", () => {
    assert.ok(state(rec({ status: "confirmed", tests: ["c/T9"] }), { model, runs: [run("r1", "failed")] }).findings.some((f) => f.includes("not a Case of the model")));
    assert.ok(state(rec(), null).findings.length > 0);
  });

  it("finds non-object records and a repeated Case in tests", () => {
    assert.ok(check(null).length > 0);
    assert.ok(check(rec({ status: "confirmed", tests: ["c/T1", "c/T1"] })).length > 0);
  });
});
