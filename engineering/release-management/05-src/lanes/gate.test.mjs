// release-management/T23 parity: the behavior of the gate beyond the RED fixtures (04-test/lanes.red.mjs).
import assert from "node:assert/strict";
import { test } from "node:test";
import { judgeLanes } from "./gate.mjs";

const expected = [{ lane: "Hosting", host: "Windows" }, { lane: "Hosting", host: "Linux" }, { lane: "Acceptance", host: "Linux" }];
const pass = (lane, host) => ({ lane, host, outcome: "passed" });
const all = [pass("Hosting", "Windows"), pass("Hosting", "Linux"), pass("Acceptance", "Linux")];
const boundary = "promotion";

test("every expected lane and host passing passes the gate", () => {
  assert.deepEqual(judgeLanes({ expected, results: all, boundary }), { passed: true, reasons: [] });
});

test("an extra lane the control does not expect cannot make the gate pass or fail", () => {
  assert.equal(judgeLanes({ expected, results: [...all, { lane: "Other", host: "Linux", outcome: "failed" }], boundary }).passed, true);
});

test("a lane that ran and failed is never excused by an Accept", () => {
  const failed = all.map((r) => (r.lane === "Acceptance" ? { ...r, outcome: "failed" } : r));
  const accept = { lane: "Acceptance", host: "Linux" };
  const verdict = judgeLanes({ expected, results: failed, accepts: [accept], authorized: [{ boundary, ...accept }], boundary });
  assert.equal(verdict.passed, false);
});

test("a renamed or dropped job is a missing lane, so no required coverage can disappear", () => {
  const renamed = all.map((r) => (r.lane === "Acceptance" ? { ...r, lane: "Acceptance (renamed)" } : r));
  const verdict = judgeLanes({ expected, results: renamed, boundary });
  assert.equal(verdict.passed, false);
  assert.match(verdict.reasons.join(), /Acceptance on Linux: missing/);
});

test("an unknown outcome counts as no outcome", () => {
  const verdict = judgeLanes({ expected, results: all.map((r) => (r.host === "Windows" ? { ...r, outcome: "neutral" } : r)), boundary });
  assert.equal(verdict.passed, false);
});
