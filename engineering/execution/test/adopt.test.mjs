import assert from "node:assert/strict";
import { it } from "node:test";
import { run } from "../adopt.mjs";
import { fixture, request, FILE } from "./plan/fixtures.mjs";

it("rejects missing ports and malformed/duplicate declarations before acquiring work", async () => {
  for (const breakInput of [f => { f.input.requests = []; }, f => { f.input.requests[1].id = "a"; }, f => { delete f.input.context; }, f => { delete f.ports.evaluate; }, f => { delete f.ports.testing.schedule; }]) {
    const f = fixture(); breakInput(f);
    await assert.rejects(run(f.input, f.ports), TypeError);
    assert.equal(f.calls.authorize.length + f.calls.execute.length + f.calls.original.length, 0);
  }
});

it("absent, refused and unavailable activation retain every original without qualification", async () => {
  for (const authorize of [undefined, async () => undefined, async () => { throw Error("authority offline"); }]) {
    const f = fixture(); f.ports.authorize = authorize;
    const r = await run(f.input, f.ports);
    assert.equal(r.mode, "original");
    assert.deepEqual(f.calls.original.map(q => q.id), ["a", "b"]);
    assert.equal(f.calls.qualify.length + f.calls.schedule.length + f.calls.execute.length, 0);
    assert.strictEqual(r.verdict, f.verdict);
  }
});

it("malformed or incomplete schedule references preserve every affected original", async () => {
  const plan = () => ({ runs: [{ file: FILE.path, sha256: FILE.sha256, subject: "a".repeat(64), platform: "linux", node: "v24.0.0", for: ["a", "b"] }], reads: [{ by: "a", file: FILE.path, run: 0 }, { by: "b", file: FILE.path, run: 0 }], findings: [] });
  for (const corrupt of [p => { p.reads.pop(); }, p => { p.reads[1].run = 10; }, p => { p.runs[0].for.push("intruder"); }, p => { p.reads.push(p.reads[0]); }, p => { p.runs[0].sha256 = "b".repeat(64); }, p => { p.reads[0].file = "other.mjs"; }, p => { p.runs[0] = null; }]) {
    const p = plan(); corrupt(p);
    const f = fixture(undefined, { schedule: () => p });
    const r = await run(f.input, f.ports);
    assert.equal(f.calls.execute.length, 0);
    assert.deepEqual(f.calls.original.map(q => q.id), ["a", "b"]);
    assert.ok(r.findings.some(x => x.code === "schedule-unqualified"));
  }
  const f = fixture([request("a", { files: [null] })], { schedule: plan });
  await run(f.input, f.ports);
  assert.equal(f.calls.original.length, 1);
});

it("original operations are ordering barriers even between equal qualified domains", async () => {
  const f = fixture([request("a"), request("opaque"), request("b")]);
  const qualify = f.ports.qualify, execute = f.ports.execute, original = f.ports.original, order = [];
  f.ports.qualify = (q, ctx) => q.id === "opaque" ? undefined : qualify(q, ctx);
  f.ports.execute = (r, d) => { order.push(r.for[0]); return execute(r, d); };
  f.ports.original = q => { order.push(q.id); return original(q); };
  await run(f.input, f.ports);
  assert.deepEqual(order, ["a", "opaque", "b"]);
  assert.equal(f.calls.schedule.length, 2);
});

it("acquisition exceptions do not retry, hide gaps, or prevent later work and evaluation", async () => {
  for (const scheduled of [false, true]) {
    const f = fixture(undefined, { authorized: scheduled });
    const failure = Error("host acquisition lost");
    if (scheduled) f.ports.execute = async () => { throw failure; };
    else { const original = f.ports.original; f.ports.original = q => q.id === "a" ? Promise.reject(failure) : original(q); }
    await assert.rejects(run(f.input, f.ports), error => {
      assert.ok(error instanceof AggregateError);
      assert.ok(error.errors.includes(failure));
      assert.strictEqual(error.report.verdict, f.verdict);
      assert.equal(error.report.advice.availability, "unknown");
      assert.strictEqual(error.report.requestResults[0].observations[0], undefined);
      assert.equal(f.calls.evaluate.length, 1);
      assert.equal(f.calls.publish.length, 1);
      assert.deepEqual(f.calls.original.map(q => q.id), scheduled ? [] : ["b"]);
      return true;
    });
  }
});

it("missing observations and missing or throwing evaluations never return a successful report", async () => {
  for (const change of [f => { f.ports.execute = () => undefined; }, f => { f.ports.evaluate = () => undefined; }, f => { f.ports.evaluate = () => { throw Error("gate lost"); }; }]) {
    const f = fixture(); change(f);
    await assert.rejects(run(f.input, f.ports), AggregateError);
  }
});

it("complete failed observations reach duplicate advice without changing the original verdict", async () => {
  const observation = { outcome: "failed", exit: 1, complete: true, cases: [{ id: "T", outcome: "failed" }], events: [] };
  const f = fixture(undefined, { observation, verdict: { result: "failed", exit: 1 } });
  const r = await run(f.input, f.ports);
  assert.equal(f.calls.duplicates.length, 1);
  assert.strictEqual(r.verdict, f.verdict);
  assert.strictEqual(r.requestResults[1].observations[0], observation);
});
