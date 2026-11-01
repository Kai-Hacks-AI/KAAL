// Proposed E-D01–E-D16 acceptance boundary. Explicit invocation only; no live lane selection.
// On review/admission these Cases, contract and fixtures become immutable to DO/CHECK.
import assert from "node:assert/strict";
import { it } from "node:test";
import { FILE, CONTEXT, request, fixture, resultFor } from "./fixtures.mjs";

async function adapter() {
  let m;
  try { m = await import("../../adopt.mjs"); }
  catch (e) { assert.fail(`blocked before behavioural assertion: no Engineering run adapter (${e.code ?? e.message})`); }
  assert.equal(typeof m.run, "function", "blocked before behavioural assertion: adapter exports run");
  return m.run;
}

it("E-D01: two qualified requests execute once and read the very same original observation", async () => {
  const run = await adapter(), f = fixture();
  const before = structuredClone(f.observation);
  const r = await run(f.input, f.ports);
  assert.deepEqual(f.observation, before, "original Case outcomes/provenance are unchanged");
  assert.equal(f.calls.execute.length, 1);
  assert.equal(f.calls.original.length, 0);
  assert.strictEqual(resultFor(r, "a").observations[0], f.observation);
  assert.strictEqual(resultFor(r, "b").observations[0], f.observation);
  for (const id of ["a", "b"]) { assert.equal(resultFor(r, id).owner, "FixtureOwner"); assert.deepEqual(resultFor(r, id).context, f.input.context); }
  assert.equal(f.calls.duplicates[0].runs.length, 1, "reads do not manufacture repeated executions");
});
it("E-D02: a shared failure stays the same failure for every reader and is never retried", async () => {
  const run = await adapter();
  const o = Object.freeze({ outcome: "failed", exit: 1, complete: true, cases: [{ id: "fixture/T1", outcome: "failed" }], events: [], diagnostics: ["original failure"], provenance: { occurrence: "failed" } });
  const f = fixture(undefined, { observation: o, verdict: Object.freeze({ result: "failed", exit: 1 }) });
  const before = structuredClone(o);
  const r = await run(f.input, f.ports);
  assert.deepEqual(o, before, "failure and its Case outcomes/provenance are unchanged");
  assert.equal(f.calls.execute.length, 1);
  assert.equal(f.calls.original.length, 0);
  for (const id of ["a", "b"]) assert.strictEqual(resultFor(r, id).observations[0], o);
  assert.strictEqual(r.verdict, f.verdict);
});
it("E-D03: shared unknown evidence retains its gap and never becomes a retry or empty GREEN", async () => {
  const run = await adapter();
  const o = Object.freeze({ outcome: "unknown", exit: 2, complete: false, cases: [], events: [], diagnostics: ["terminal event missing"], provenance: { occurrence: "incomplete" } });
  const f = fixture(undefined, { observation: o, verdict: Object.freeze({ result: "unresolved", exit: 2 }) });
  const before = structuredClone(o);
  const r = await run(f.input, f.ports);
  assert.deepEqual(o, before, "unknown evidence is unchanged");
  assert.equal(f.calls.execute.length, 1);
  assert.equal(f.calls.original.length, 0);
  assert.strictEqual(resultFor(r, "a").observations[0], o);
  assert.strictEqual(resultFor(r, "b").observations[0], o);
  assert.strictEqual(r.verdict, f.verdict);
});
it("E-D04: every Testing identity dimension is forwarded unchanged to the owner scheduling port", async () => {
  const run = await adapter();
  for (const extra of [{ files: [{ ...FILE, path: "other.mjs" }] }, { files: [{ ...FILE, sha256: "2".repeat(64) }] }, { subject: "b".repeat(64) }, { platform: "win32" }, { node: "v24.1.0" }]) {
    const qs = [request("a"), request("b", extra)];
    const f = fixture(qs, { schedule: (seen) => {
      assert.deepEqual(seen, qs.map((q) => ({ by: q.id, files: q.files, subject: q.subject, platform: q.platform, node: q.node })));
      return { runs: seen.map((q) => ({ file: q.files[0].path, sha256: q.files[0].sha256, subject: q.subject, platform: q.platform, node: q.node, for: [q.by] })), reads: [{ by: "a", file: qs[0].files[0].path, run: 0 }, { by: "b", file: qs[1].files[0].path, run: 1 }], findings: [] };
    } });
    await run(f.input, f.ports);
    assert.equal(f.calls.schedule.length, 1);
    assert.equal(f.calls.execute.length, 2, "the adapter obeys Testing's distinct-run plan");
  }
});
it("E-D05: independently qualified wider conditions partition domains before Testing is called", async () => {
  const run = await adapter();
  for (const field of ["arch", "cwd", "flags", "loader", "dependencies", "fixture", "seed", "coverage"]) {
    const qs = [request("a"), request("b", { variant: field })];
    const f = fixture(qs, { qualify: (q) => ({ domain: q.variant ? `other-${field}` : "base", request: { by: q.id, files: q.files, subject: q.subject, platform: q.platform, node: q.node }, source: "fixture independent configuration authority" }) });
    await run(f.input, f.ports);
    assert.equal(f.calls.qualify.length, 2);
    assert.equal(f.calls.schedule.length, 2);
    assert.ok(f.calls.schedule.every((qs) => qs.length === 1));
    assert.equal(f.calls.execute.length, 2);
  }
});
it("E-D06: identical tuples do not override independently required Core or repeatability invocations", async () => {
  const run = await adapter();
  const qs = [request("core:publisher", { owner: "Core" }), request("core:boundary", { owner: "Core" }), request("guard:T106:first"), request("guard:T106:second")];
  const f = fixture(qs, { qualify: () => undefined });
  const r = await run(f.input, f.ports);
  assert.equal(f.calls.execute.length, 0);
  assert.deepEqual(f.calls.original.map((q) => q.id), qs.map((q) => q.id));
  for (const q of qs) assert.strictEqual(resultFor(r, q.id).observations[0], f.originalObservations.get(q.id));
});
it("E-D07: an invalid mixed schedule retains findings and executes every affected original request", async () => {
  const run = await adapter();
  const f = fixture([request("a"), request("b", { files: [{ path: FILE.path }] })], { schedule: () => ({ runs: [], reads: [], findings: ["unreadable file bytes"] }) });
  const r = await run(f.input, f.ports);
  assert.equal(f.calls.execute.length, 0);
  assert.deepEqual(f.calls.original.map((q) => q.id), ["a", "b"]);
  assert.ok(r.findings.some((x) => x.code === "schedule-unqualified"));
  assert.deepEqual(r.advice.schedulingFindings, ["unreadable file bytes"]);
  assert.ok(resultFor(r, "a") && resultFor(r, "b"));
});
it("E-D08: an opaque entrypoint without an owner contract executes intact, including its original outcome", async () => {
  const run = await adapter(), q = request("opaque", { entrypoint: "npm test", qualified: true });
  const f = fixture([q], { qualify: () => undefined });
  const before = structuredClone(f.input);
  const r = await run(f.input, f.ports);
  assert.strictEqual(f.calls.original[0], q);
  assert.equal(f.calls.schedule.length, 0);
  assert.strictEqual(resultFor(r, "opaque").observations[0], f.originalObservations.get("opaque"));
  assert.deepEqual(f.input, before);
});
it("E-D09: missing or ambiguous loaded-byte binding cannot be replaced by a candidate's qualified label", async () => {
  const run = await adapter();
  for (const why of ["receipt missing", "ambiguous terminal event", "unsupported loader"]) {
    const f = fixture([request("a", { qualified: true, qualification: why })], { qualify: () => undefined });
    await run(f.input, f.ports);
    assert.equal(f.calls.qualify.length, 1);
    assert.equal(f.calls.execute.length, 0);
    assert.equal(f.calls.original.length, 1);
  }
});
it("E-D10: missing, skipped, cancelled and substituted Cases retain the original incomplete assurance", async () => {
  const run = await adapter();
  for (const cause of ["missing", "skipped", "cancelled", "stand-in"]) {
    const o = Object.freeze({ outcome: "unknown", complete: false, events: [], cases: [{ id: "fixture/T1", outcome: cause }], diagnostics: [cause] });
    const f = fixture([request("a")], { qualify: () => undefined, original: () => o, verdict: Object.freeze({ result: "unresolved", exit: 2, cause }) });
    const before = structuredClone(o);
    const r = await run(f.input, f.ports);
    assert.deepEqual(o, before);
    assert.strictEqual(r.verdict, f.verdict);
    assert.strictEqual(resultFor(r, "a").observations[0], o);
    assert.strictEqual(f.calls.evaluate[0].requestResults[0].observations[0], o);
  }
});
it("E-D11: separate jobs, hosts, attempts, workflows, consumers and RED/GREEN contexts retain independent executions", async () => {
  const run = await adapter();
  for (const [field, value] of [["job", "job-2"], ["platform", "win32"], ["attempt", 2], ["workflow", "another"], ["consumer", "fresh-2"], ["subject", "mutant"], ["run", "run-2"]]) {
    const f = fixture([request("a")]);
    await run(f.input, f.ports);
    const other = { ...f.input, context: { ...f.input.context, [field]: value } };
    await run(other, f.ports);
    assert.equal(f.calls.execute.length, 2, `no cache crosses ${field}`);
    assert.equal(f.calls.authorize.length, 2);
  }
});
it("E-D12: owner APIs are called through public signatures and their advisory result is retained unchanged", async () => {
  const run = await adapter(), f = fixture();
  const r = await run(f.input, f.ports);
  assert.equal(f.calls.schedule.length, 1);
  assert.equal(f.calls.duplicates.length, 1);
  assert.deepEqual(f.calls.duplicates[0], { runs: f.observation.events });
  assert.strictEqual(r.advice.duplicates, f.advice);
  assert.strictEqual(r.verdict, f.verdict);
});
it("E-D13: the same orchestration contract consumes the actual Testing public exports", async () => {
  const run = await adapter();
  let testing;
  try { testing = await import("kaal-testing/duplicates"); }
  catch (e) { assert.fail(`blocked before behavioural assertion: Testing dependency unavailable (${e.code})`); }
  const f = fixture();
  f.ports.testing = { schedule: testing.schedule, duplicates: testing.duplicates };
  const r = await run(f.input, f.ports);
  assert.equal(f.calls.execute.length, 1);
  assert.strictEqual(resultFor(r, "a").observations[0], f.observation);
  assert.strictEqual(resultFor(r, "b").observations[0], f.observation);
  assert.equal(r.advice.duplicates.result, "unchallenged");
  assert.strictEqual(r.verdict, f.verdict);
});
it("E-D14: advisory failures preserve original exit, owner verdict identity and required later work", async () => {
  const run = await adapter();
  for (const broken of ["analysis", "publication", "schedule", "qualification"]) {
    const f = fixture(undefined, { qualify: broken === "qualification" ? () => { throw Error("qualification unavailable"); } : () => undefined, verdict: Object.freeze({ result: "failed", exit: 1, causes: ["original failure"] }), duplicates: broken === "analysis" ? () => { throw Error("analysis unavailable"); } : undefined, publish: broken === "publication" ? () => { throw Error("publish unavailable"); } : undefined });
    if (broken === "schedule") { f.ports.qualify = (q) => ({ domain: "fixture-domain", request: { by: q.id, files: q.files, subject: q.subject, platform: q.platform, node: q.node } }); f.ports.testing.schedule = () => { throw Error("schedule unavailable"); }; }
    const r = await run(f.input, f.ports);
    assert.strictEqual(r.verdict, f.verdict);
    assert.deepEqual(f.calls.original.map((q) => q.id), ["a", "b"], "later work survives");
    assert.ok(resultFor(r, "a") && resultFor(r, "b"));
    assert.ok(r.findings.length > 0, "advisory/qualification uncertainty is visible");
  }
});
it("E-D15: request permutation preserves attribution, and mutating one input cannot stand in for a lost required result", async () => {
  const run = await adapter();
  const first = fixture(), second = fixture([request("b"), request("a")]);
  const before = structuredClone(first.input);
  const a = await run(first.input, first.ports), b = await run(second.input, second.ports);
  assert.deepEqual(a.requestResults.map((r) => r.id).sort(), ["a", "b"]);
  assert.deepEqual(b.requestResults.map((r) => r.id).sort(), ["a", "b"]);
  assert.equal(first.calls.execute.length, 1);
  assert.equal(second.calls.execute.length, 1);
  assert.deepEqual(first.input, before);
  for (const id of ["a", "b"]) { assert.strictEqual(resultFor(b, id).observations[0], second.observation); assert.equal(resultFor(b, id).owner, "FixtureOwner"); assert.deepEqual(resultFor(b, id).context, second.input.context); }
});
it("E-D16: self-claimed activation or incomplete measurements never enable reuse without independent authorization", async () => {
  const run = await adapter();
  for (const measurements of [{ linux: 3 }, { linux: 3, win32: 3 }, { linux: 2, win32: 3, darwin: 3 }, { linux: 3, win32: 3, darwin: 3 }]) {
    const f = fixture(undefined, { authorized: false });
    f.input.context = { ...CONTEXT, activated: true, measurements, candidateApproved: true };
    const r = await run(f.input, f.ports);
    assert.equal(f.calls.authorize.length, 1);
    assert.equal(f.calls.execute.length, 0);
    assert.deepEqual(f.calls.original.map((q) => q.id), ["a", "b"]);
    assert.equal(r.mode, "original");
    assert.ok(r.findings.some((x) => x.code === "activation-unqualified"));
  }
});
