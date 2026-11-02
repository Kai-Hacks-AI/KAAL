// Additional implementation checks; the C50 assertions remain untouched.
import assert from "node:assert/strict";
import { it } from "node:test";
import { duplicates, schedule } from "kaal-testing/duplicates";

const on = { subject: "a".repeat(64), platform: "linux", node: "v24.0.0" };
const file = { path: "cases.mjs", sha256: "b".repeat(64) };
const request = (by, extra = {}) => ({ by, files: [file], ...on, ...extra });

it("independent executions have separate schedules; failures and unknown observations are shared unchanged within one execution", () => {
  const q = [request("one"), request("two")];
  const a = schedule(q), b = schedule(q);
  assert.deepEqual(a, b);
  assert.equal(a.runs.length, 1);
  assert.notEqual(a.runs, b.runs, "no cached observation or retained plan crosses executions");
  for (const observation of [{ outcome: "failed", evidence: "failure" }, { outcome: "unknown", evidence: "incomplete" }]) {
    const observed = [Object.freeze(observation)];
    assert.deepEqual(a.reads.map((r) => observed[r.run]), [observation, observation]);
    assert.ok(a.reads.every((r) => observed[r.run] === observation));
    assert.equal(schedule(q).runs.length, 1, "an earlier failed/unknown execution cannot suppress a later independently required run");
  }
  for (const extra of [
    { subject: "c".repeat(64) }, { platform: "win32" }, { node: "v24.1.0" },
    { files: [{ ...file, sha256: "d".repeat(64) }] }, { files: [{ ...file, path: "other.mjs" }] },
  ]) assert.equal(schedule([request("one"), request("two", extra)]).runs.length, 2);
});

it("unknown input plans nothing, even beside valid requests; findings and floating durations are permutation independent", () => {
  for (const bad of [null, [], {}, { ...request("bad"), files: [null] }, { ...request("bad"), platform: " " }]) {
    const s = schedule([request("good"), bad]);
    assert.ok(s.findings.length);
    assert.deepEqual([s.runs, s.reads], [[], []]);
  }
  const run = { case: "T1", file: file.path, sha256: file.sha256, ...on };
  const runs = [1e16, 0.1, 2, 1].map((ms) => ({ ...run, ms }));
  assert.deepEqual(duplicates({ runs }), duplicates({ runs: [...runs].reverse() }));
  assert.deepEqual(schedule([]), { runs: [], reads: [], findings: [] });
  const equalWaste = ["a", "b"].flatMap((c) => [1, 2].map((ms) => ({ ...run, subject: c.repeat(64), ms })));
  assert.deepEqual(duplicates({ runs: equalWaste }), duplicates({ runs: [...equalWaste].reverse() }));
});
