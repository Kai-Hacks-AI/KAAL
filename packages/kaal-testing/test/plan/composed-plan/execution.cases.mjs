// Proposed immutable coordinator boundary. Explicit invocation only during PLAN.
import assert from "node:assert/strict";
import { it } from "node:test";
import { fixture as controlled, manifest, fileHash, observationFor } from "./fixtures.mjs";
import { schedule } from "../../../lib/duplicates.mjs";
const fixture = value => controlled(value, schedule);
async function operation() {
  let m;
  try { m = await import("../../../lib/plan-execution.mjs"); }
  catch (e) { assert.fail(`blocked before behavioural assertion: composed Plan execution is absent (${e.code ?? e.message})`); }
  assert.equal(typeof m.executePlan, "function", "blocked before behavioural assertion: executePlan export absent");
  return m.executePlan;
}
it("CP01: overlapping Suite memberships schedule three files once and retain both reads of b", async () => {
  const executePlan = await operation(), f = fixture();
  const before = structuredClone(f.value);
  const r = await executePlan(f.value, f.context, f.ports);
  assert.deepEqual(f.calls.observe.map(x => x.run.file), ["a.test.mjs", "b.test.mjs", "c.test.mjs"]);
  assert.equal(f.calls.schedule.length, 1);
  assert.deepEqual(f.calls.schedule[0], f.value.suites.map(s => ({ by: s.id, subject: f.value.subject, platform: f.context.platform, node: f.context.node, files: s.files.map(path => ({ path, sha256: fileHash(path) })) })));
  assert.strictEqual(observationFor(r, "A", "b.test.mjs"), f.observations.get("b.test.mjs"));
  assert.strictEqual(observationFor(r, "B", "b.test.mjs"), f.observations.get("b.test.mjs"));
  assert.deepEqual(r.suites.map(s => [s.id, s.result]), [["A", "passed"], ["B", "passed"]]);
  assert.equal(r.result, "passed"); assert.equal(r.exit, 0);
  assert.deepEqual(f.value, before);
});
it("CP02: a shared failed file fails both Suites without retry and later files still run", async () => {
  const executePlan = await operation(), f = fixture();
  const failure = Object.freeze({ result: "failed", runnerExit: 1, complete: true, cases: [{ name: "b > failure", outcome: "failed", reason: "original assertion" }], stdout: "original", stderr: "diagnosis", provenance: { occurrence: "b-failure" } });
  f.observations.set("b.test.mjs", failure);
  const r = await executePlan(f.value, f.context, f.ports);
  assert.equal(f.calls.observe.length, 3);
  assert.equal(f.calls.observe.at(-1).run.file, "c.test.mjs");
  for (const s of ["A", "B"]) { assert.strictEqual(observationFor(r, s, "b.test.mjs"), failure); assert.equal(r.suites.find(x => x.id === s).result, "failed"); }
  assert.equal(r.result, "failed"); assert.equal(r.exit, 1);
});
it("CP03: incomplete shared observations remain unknown for every reader, with original evidence intact", async () => {
  const executePlan = await operation(), f = fixture();
  const unknown = Object.freeze({ result: "unknown", runnerExit: 0, complete: false, cases: [{ name: "b > skipped", outcome: "skipped", reason: "fixture unavailable" }], stdout: "original", stderr: "", provenance: { occurrence: "incomplete" } });
  f.observations.set("b.test.mjs", unknown);
  const r = await executePlan(f.value, f.context, f.ports);
  assert.equal(f.calls.observe.length, 3);
  for (const s of ["A", "B"]) { assert.strictEqual(observationFor(r, s, "b.test.mjs"), unknown); assert.equal(r.suites.find(x => x.id === s).result, "unknown"); }
  assert.equal(r.result, "unknown"); assert.equal(r.exit, 2);
});
it("CP04: invocation and fixture/configuration contexts never share a retained execution cache", async () => {
  const executePlan = await operation(), f = fixture();
  await executePlan(f.value, f.context, f.ports);
  await executePlan(f.value, { ...f.context, cwd: "/another-fixture-consumer" }, f.ports);
  assert.equal(f.calls.observe.length, 6);
  assert.equal(f.calls.schedule.length, 2);
  assert.equal(f.calls.observe[3].context.cwd, "/another-fixture-consumer");
});
it("CP05: invalid manifests and per-Suite execution overrides are refused before any file runs", async () => {
  const executePlan = await operation();
  for (const change of [m => { m.suites = []; }, m => { m.suites[1].id = "A"; }, m => { m.suites[0].files = []; }, m => { m.suites[0].files = ["../outside.test.mjs"]; }, m => { m.suites[0].files = ["*.test.mjs"]; }, m => { m.suites[0].flags = ["--test-name-pattern=only-me"]; }, m => { m.suites[0].fixtures = "another-dataset"; }]) {
    const value = manifest(); change(value); const f = fixture(value);
    const r = await executePlan(f.value, f.context, f.ports);
    assert.equal(r.result, "unknown"); assert.equal(r.exit, 2);
    assert.equal(f.calls.observe.length, 0);
    assert.equal(f.calls.schedule.length, 0);
    assert.ok(r.findings.length > 0);
  }
});
it("CP06: unreadable source prevents partial Plan execution and cannot become an empty GREEN", async () => {
  const executePlan = await operation(), f = fixture();
  f.ports.read = async file => { if (file === "b.test.mjs") throw Error("unreadable source"); return new TextEncoder().encode(file); };
  const r = await executePlan(f.value, f.context, f.ports);
  assert.equal(f.calls.observe.length, 0); assert.equal(f.calls.schedule.length, 0);
  assert.equal(r.result, "unknown"); assert.equal(r.exit, 2); assert.ok(r.findings.length > 0);
});
it("CP07: invalid or incomplete owner schedules never omit a required Suite/file obligation", async () => {
  const executePlan = await operation();
  for (const broken of [() => ({ runs: [], reads: [], findings: ["invalid requests"] }), () => ({ runs: [], reads: [], findings: [] }), () => { throw Error("scheduler unavailable"); }]) {
    const f = fixture(); f.ports.schedule = broken;
    const r = await executePlan(f.value, f.context, f.ports);
    assert.equal(f.calls.observe.length, 0); assert.equal(r.result, "unknown"); assert.equal(r.exit, 2);
    assert.ok(r.findings.length > 0);
    assert.deepEqual(r.suites.map(s => s.id), ["A", "B"]);
  }
});
it("CP08: acquisition exceptions preserve later required work and failed evidence dominates unknown gaps", async () => {
  const executePlan = await operation(), f = fixture(), seen = [];
  f.observations.set("c.test.mjs", { result: "failed", runnerExit: 1, complete: true, cases: [{ name: "c", outcome: "failed" }] });
  f.ports.observe = async run => { seen.push(run.file); if (run.file === "b.test.mjs") throw Error("child could not start"); return f.observations.get(run.file); };
  const r = await executePlan(f.value, f.context, f.ports);
  assert.deepEqual(seen, ["a.test.mjs", "b.test.mjs", "c.test.mjs"]);
  assert.equal(r.suites.find(x => x.id === "A").result, "unknown");
  assert.equal(r.suites.find(x => x.id === "B").result, "failed");
  assert.equal(r.result, "failed"); assert.equal(r.exit, 1); assert.ok(r.findings.length > 0);
});
it("CP09: Suite permutation preserves attribution and original Case outcomes/provenance", async () => {
  const executePlan = await operation(), f = fixture(); f.value.suites.reverse();
  const original = structuredClone([...f.observations]);
  const r = await executePlan(f.value, f.context, f.ports);
  assert.deepEqual([...f.observations], original);
  for (const suite of f.value.suites) for (const file of suite.files) assert.strictEqual(observationFor(r, suite.id, file), f.observations.get(file));
  assert.equal(r.executions.length, 3); assert.equal(f.calls.observe.length, 3);
});
