// #773 PLAN addendum. These cases, fixtures and helpers are immutable to DO/CHECK.
// Subject: the future Engineering adapter, not Testing's timing algorithms.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { it } from "node:test";
import { fixture, testing, preservation, timingRow, setLatestVersion, dropRun, clone, checkFixtures, H1, H2, KEY, HOSTS } from "./fixtures.mjs";

checkFixtures();
const SUBJECT = new URL("../../analyze.mjs", import.meta.url);
async function subject() {
  let api;
  try { api = await import(SUBJECT.href); }
  catch (e) { assert.fail(`blocked before behavioural assertion: Engineering timing adapter is unavailable (${e.code ?? e.message})`); }
  for (const name of ["analyze", "observe"]) assert.equal(typeof api[name], "function", `blocked before behavioural assertion: no ${name} export`);
  return api;
}
const current = (f, host = "linux") => f.observations.records.find((r) => f.authority.bindings[r.ref].run === f.authority.current.run && r.body.host === host && f.authority.bindings[r.ref].attempt === f.authority.current.attempt);
const code = (r, expected) => assert.ok(r.findings.some((f) => f.code === expected), `missing finding ${expected}: ${JSON.stringify(r.findings)}`);
const unknown = (r, channel, expected) => { assert.equal(r[channel].availability, "unknown"); code(r, expected); };
async function analyze(f = fixture(), t = testing()) {
  const { analyze } = await subject();
  const before = clone(f);
  const r = await analyze(f.observations, f.authority, t.port);
  assert.deepEqual(f, before, "analysis changes no source, authority, declaration or original result");
  return { r, t };
}
async function positive() {
  const f = fixture(), t = testing();
  const { r } = await analyze(f, t);
  assert.equal(r.history.availability, "available");
  assert.deepEqual(r.history.value, t.replies.candidates, "keep the owner's result and findings");
  assert.equal(r.skew.availability, "available");
  assert.equal(t.calls.profile.length, 3);
  assert.equal(t.calls.skew.length, 1);
  assert.equal(t.calls.candidates.length, 1);
  return { f, t, r };
}

it("engineering/timing/E01 [R1,R2]: legacy outcome records survive, while missing timings stay unknown", async () => {
  await positive();
  const f = fixture();
  for (const r of f.observations.records) { delete r.body.schema; delete r.body.producer; for (const c of r.body.cases) delete c.timing; }
  const { r, t } = await analyze(f);
  unknown(r, "history", "timing-absent");
  assert.equal(r.sources.length,f.observations.records.length);
  for (const source of f.observations.records) assert.deepEqual(r.sources.find((s) => s.ref === source.ref).body, source.body);
  assert.equal(t.calls.profile.length, 0, "no duration from job time, zero or another record");
});

it("engineering/timing/E02 [R1]: an observed zero is retained; missing timing/hash or changed source bytes is unknown", async () => {
  const f = fixture(); current(f).body.cases[0].timing.ms = 0;
  const { r, t } = await analyze(f);
  assert.equal(r.history.availability, "available");
  assert.ok(t.calls.profile.some(([run]) => run.cases.some((c) => c.name === KEY("guard/T1") && c.ms === 0)));
  for (const fault of ["missing", "changed"]) {
    const bad = fixture(), row = current(bad).body.cases[0];
    if (fault === "missing") delete row.timing.fileVersion;
    else row.timing.fileVersion.after = H2;
    const { r } = await analyze(bad);
    unknown(r, "history", "file-version-conflict");
    assert.deepEqual(r.sources.find((s) => s.ref === current(bad).ref).body.cases, current(bad).body.cases);
  }
});

it("engineering/timing/E03 [R1,R4]: duplicate occurrences, nested timings and colliding shortened identities are not merged", async () => {
  await positive();
  for (const fault of ["repeat", "nested", "collision", "event"]) {
    const f = fixture(), record = current(f);
    if (fault === "repeat") record.body.cases[0].timing.occurrences = 2;
    if (fault === "nested") record.body.cases[0].timing.scope = "subtest";
    if (fault === "collision") record.body.cases.push(clone(record.body.cases[0]));
    if (fault === "event") record.body.cases[1].timing.event = record.body.cases[0].timing.event;
    const { r } = await analyze(f);
    unknown(r, "history", "execution-ambiguous");
    assert.deepEqual(r.sources.find((s) => s.ref === record.ref).body.cases, record.body.cases);
  }
});

it("engineering/timing/E04 [R2,R3]: an independently bound synthetic checkout is valid; conflicting or self-claimed provenance is not", async () => {
  const { f, r } = await positive();
  assert.notEqual(f.authority.current.candidate, f.authority.runs.at(-1).head);
  assert.ok(r.sources.every((s) => s.availability === "available"));
  for (const fault of ["candidate", "repository", "producer", "digest", "self-attested"]) {
    const bad = fixture(), rec = current(bad), binding = bad.authority.bindings[rec.ref];
    if (fault === "candidate") rec.body.candidate = "another-checkout";
    if (fault === "repository") binding.repository = "other/repository";
    if (fault === "producer") rec.body.producer.revision = "unreviewed-producer";
    if (fault === "digest") binding.integrity = "mismatch";
    if (fault === "self-attested") { delete binding.producer; rec.body.verified = true; }
    const { r } = await analyze(bad);
    unknown(r, "history", fault === "digest" ? "source-integrity" : fault === "self-attested" ? "producer-unknown" : "provenance-conflict");
  }
});

it("engineering/timing/E05 [R2,R4]: skew requires the same candidate, Cases, versions, attempt and comparable configuration on every host", async () => {
  await positive();
  for (const fault of ["host", "node", "runner", "coverage", "data", "candidate", "attempt", "version"]) {
    const f = fixture(), rec = current(f, "win32"), b = f.authority.bindings[rec.ref];
    if (fault === "host") f.observations.records = f.observations.records.filter((r) => r !== rec);
    if (fault === "node") { b.config.node = "v26.0.0"; rec.body.node = b.config.node; }
    if (fault === "runner") b.config.runnerClass = "different-runner-class";
    if (fault === "coverage") b.config.instrumentation = "coverage";
    if (fault === "data") b.config.testData = H2;
    if (fault === "candidate") rec.body.candidate = "another-candidate";
    if (fault === "attempt") b.attempt = 2;
    if (fault === "version") { rec.body.cases[0].timing.fileVersion = { before:H2, executed:H2, after:H2 }; b.expectedCases[0].version = H2; }
    const { r, t } = await analyze(f);
    assert.equal(r.skew.availability, "unknown", fault);
    assert.equal(t.calls.skew.length, 0, `${fault}: do not ask Testing to compare an unqualified host set`);
    if (fault === "host") code(r, "host-missing");
    if (["node", "runner", "coverage", "data"].includes(fault)) code(r, "configuration-conflict");
  }
});

it("engineering/timing/E06 [R1,R4,R5]: no partial distribution or skip overhead stands for Case execution; completed failures keep their time", async () => {
  const f = fixture(); current(f).body.cases[5].outcome = "failed"; current(f).body.suites[0].status = "failed";
  const { r, t } = await analyze(f);
  assert.ok(t.calls.profile.some(([run]) => run.cases.some((c) => c.name === KEY("guard/T6") && c.ms === 9000)));
  assert.equal(r.sources.find((s) => s.ref === current(f).ref).body.cases[5].outcome, "failed");
  for (const fault of ["omitted", "job-time", "skip"]) {
    const bad = fixture(), record = current(bad);
    if (fault === "omitted") record.body.cases.pop();
    if (fault === "job-time") record.body.cases[5].timing.scope = "job";
    if (fault === "skip") { record.body.cases[5].outcome = "not run"; record.body.cases[5].reason = "skipped"; }
    const { r, t } = await analyze(bad);
    unknown(r, "history", fault === "omitted" ? "population-incomplete" : fault === "skip" ? "execution-missing" : "execution-ambiguous");
    assert.ok(t.calls.profile.every(([run]) => run.cases.length === 6));
  }
});

it("engineering/timing/E07 [R3]: retries, platforms, downloads and repeated analysis do not manufacture independent recurrences", async () => {
  await positive();
  const f = fixture(); dropRun(f, "101");
  f.observations.records.push(...clone(f.observations.records.slice(-3)));
  const empty = { result: "unchallenged", candidates: [], refactors: [], unprofiled: [], findings: [] };
  for (let i = 0; i < 2; i++) {
    const { r, t } = await analyze(f, testing({ history: empty }));
    assert.equal(t.calls.candidates[0][0].length, 6, "two logical runs on three platforms, despite repeated downloads");
    assert.equal(r.history.availability, "pending");
    assert.deepEqual(r.history.value.candidates, []);
    code(r, "duplicate-source");
  }
});

it("engineering/timing/E08 [R3,R4]: an incomplete latest attempt cannot borrow an earlier complete attempt", async () => {
  await positive();
  const f = fixture(); f.authority.current.attempt = 2; f.authority.runs.at(-1).latestAttempt = 2;
  for (const old of [...f.observations.records].filter((r) => r.ref.startsWith("103/1/"))) {
    const next = clone(old), b = clone(f.authority.bindings[old.ref]);
    next.ref = old.ref.replace("/1/", "/2/"); b.ref = next.ref; b.attempt = 2; b.artifact = `artifact-${next.ref}`;
    f.authority.bindings[next.ref] = b; f.observations.records.push(next);
  }
  const complete = await analyze(f);
  assert.equal(complete.r.history.availability,"available");
  assert.equal(complete.t.calls.candidates[0][0].length,9,"latest attempts only");
  current(f,"win32").body.cases.pop();
  const { r } = await analyze(f);
  unknown(r, "history", "current-attempt-incomplete");
  assert.equal(r.skew.availability, "unknown");
});

it("engineering/timing/E09 [R3]: source chronology is explicit; expiry, missing records and incomplete enumeration stay unknown", async () => {
  const f = fixture(); f.observations.records.reverse();
  const { t } = await analyze(f);
  assert.equal(t.calls.candidates.length,1);
  assert.deepEqual(t.calls.candidates[0][0].map((run) => run.cases.find((c) => c.name === KEY("guard/T1")).ms), [101,101,101,102,102,102,103,103,103]);
  for (const fault of ["expired", "missing", "page", "order"]) {
    const bad = fixture();
    if (fault === "expired") bad.authority.bindings[bad.observations.records[0].ref].expired = true;
    if (fault === "missing") bad.observations.records.shift();
    if (fault === "page") bad.authority.enumeration.pages[0].next = "missing-page";
    if (fault === "order") bad.authority.runs[1].ordinal = bad.authority.runs[0].ordinal;
    const { r } = await analyze(bad);
    unknown(r, "history", fault === "expired" ? "source-expired" : fault === "page" ? "history-pagination" : fault === "order" ? "history-chronology" : "history-gap");
  }
});

it("engineering/timing/E10 [R2,R3,R4,R5]: Engineering delegates recurring signals and preserves insufficient-data and cohort limits", async () => {
  const { f, t, r } = await positive();
  assert.deepEqual(t.calls.candidates[0][1], f.authority.policy.redesign);
  assert.deepEqual(r.history.value, t.replies.candidates);
  const unreadable = { result:"unknown", candidates:[], refactors:[], unprofiled:[], findings:["owner: cannot profile this input"] };
  const rejected = await analyze(fixture(),testing({history:unreadable}));
  assert.equal(rejected.r.history.availability,"unknown"); assert.deepEqual(rejected.r.history.value,unreadable);
  const short = fixture(); dropRun(short, "101");
  const noCandidate = { result: "unchallenged", candidates: [], refactors: [], unprofiled: [], findings: [] };
  const pending = await analyze(short, testing({ history: noCandidate }));
  assert.equal(pending.r.history.availability, "pending");
  assert.deepEqual(pending.r.history.value, noCandidate);
  const changed = fixture(); changed.authority.bindings[current(changed).ref].cohort = "other-cohort";
  unknown((await analyze(changed)).r, "history", "cohort-conflict");
});

it("engineering/timing/E11 [R1,R4,R5]: a shared-file reset includes untouched Cases; an unrun current version cannot borrow old evidence", async () => {
  const f = fixture(); setLatestVersion(f);
  const t = testing({ history: { result: "unchallenged", candidates: [], refactors: [], unprofiled: [], findings: [] } });
  await analyze(f, t);
  assert.equal(t.calls.candidates.length,1);
  const last = t.calls.candidates[0][0].slice(-3);
  for (const run of last) for (const id of ["guard/T5", "guard/T6"]) assert.equal(run.cases.find((c) => c.name === KEY(id)).sha256, H2);
  for (const run of t.calls.candidates[0][0].slice(0,3)) assert.equal(run.cases.find((c) => c.name === KEY("guard/T6")).sha256, H1);
  const bad = fixture(); setLatestVersion(bad);
  const row = current(bad).body.cases[5]; row.outcome = "not run"; row.reason = "interrupted"; delete row.timing;
  const { r } = await analyze(bad);
  unknown(r, "history", "current-version-unobserved");
  assert.ok(!r.advice.some((a) => a.kind === "redesign" && a.version === H1));
});

it("engineering/timing/E12 [R6]: faster timing cannot turn lost RED discrimination, targets or subjects into kept", async () => {
  for (const fault of ["none", "RED", "target", "subject"]) {
    const f = fixture(), row = preservation(f);
    const p = f.observations.preservation[0], b = f.authority.preservationBindings[p.ref];
    if (fault === "RED") p.after.verdicts.mutant = "pass";
    if (fault === "target") { p.before.tests.push("guard/F2"); b.targets.before.push("guard/F2");
      for (const binding of Object.values(f.authority.bindings)) for (const d of binding.expectedCases) if (d.id === "guard/T6" && d.version === H1) d.targets.push("guard/F2");
    }
    if (fault === "subject") delete p.after.verdicts.mutant;
    const behaviour = fault === "none" ? { result: "kept", differences: [], findings: [] } : { result: "changed", differences: [`fixture: ${fault} changed`], findings: [] };
    const t = testing({ rows: [row], behaviour }); const { r } = await analyze(f, t);
    assert.deepEqual(t.calls.refactored, [[p.before,p.after]]);
    assert.equal(r.comparisons[0].timing.shown, "faster");
    assert.deepEqual(r.comparisons[0].preservation.value, behaviour);
  }
});

it("engineering/timing/E13 [R6]: missing discrimination stays Testing-unknown; missing authority cannot self-certify preservation", async () => {
  for (const missing of ["RED","GREEN"]) {
    const f = fixture(), row = preservation(f, { result: "unknown" });
    if (missing === "GREEN") f.observations.preservation[0].before.verdicts = { mutant:"fail" };
    const value = { result: "unknown", differences: [], findings: [`no earlier ${missing}`] };
    const { r } = await analyze(f, testing({ rows: [row], behaviour: value }));
    assert.equal(r.comparisons.length,1);
    assert.equal(r.comparisons[0].preservation.value.result, "unknown");
  }
  for (const fault of ["producer", "targets", "integrity"]) {
    const bad = fixture(), row = preservation(bad), p = bad.observations.preservation[0], b = bad.authority.preservationBindings[p.ref];
    if (fault === "producer") delete b.producer;
    if (fault === "targets") delete b.targets;
    if (fault === "integrity") b.integrity = "unestablished";
    p.verified = true;
    const { r, t } = await analyze(bad, testing({ rows: [row] }));
    code(r, "preservation-untrusted"); assert.equal(t.calls.refactored.length, 0);
    assert.equal(r.comparisons[0].preservation.availability, "unknown");
  }
});

it("engineering/timing/E14 [R6]: another Case, version pair or subject behind the same label supplies no matching check", async () => {
  const good = fixture(), row = preservation(good);
  const baseline = (await analyze(good, testing({ rows: [row] }))).r; assert.equal(baseline.comparisons.length,1);
  assert.equal(baseline.comparisons[0].preservation.value.result, "kept");
  for (const fault of ["case", "version", "subject"]) {
    const f = fixture(), row = preservation(f), p = f.observations.preservation[0];
    if (fault === "case") p.case = KEY("guard/T5");
    if (fault === "version") p.to = H1;
    if (fault === "subject") p.subjects.mutant.bytes = H1;
    const { r, t } = await analyze(f, testing({ rows: [row] }));
    code(r, fault === "subject" ? "preservation-subject-conflict" : "preservation-join");
    assert.equal(t.calls.refactored.length, 0);
    assert.notEqual(r.comparisons[0].preservation.value?.result, "kept");
  }
});

it("engineering/timing/E15 [R6]: kept can accompany not faster or pending; absent proof is not assessed", async () => {
  for (const shown of ["not faster", "pending"]) {
    const f = fixture(), row = preservation(f, { shown });
    const { r } = await analyze(f, testing({ rows: [row] }));
    assert.equal(r.comparisons.length,1);
    assert.equal(r.comparisons[0].timing.shown, shown);
    assert.equal(r.comparisons[0].preservation.value.result, "kept");
  }
  const f = fixture(), row = preservation(f); f.observations.preservation = [];
  const { r } = await analyze(f, testing({ rows: [row] }));
  assert.equal(r.comparisons[0].preservation.availability, "not assessed");
});

it("engineering/timing/E16 [R5]: original CI exits and completeness survive challenges, analysis exceptions and publication failure", async () => {
  const api = await subject();
  for (const exit of [0,1,2]) for (const fault of ["none", "analysis", "publish"]) {
    const original = { result: exit === 0 ? "passed" : exit === 1 ? "failed" : "unknown", exit, completeness: exit === 2 ? "incomplete" : "complete", cases: { passed: 5, failed: exit === 1 ? 1 : 0, notRun: exit === 2 ? 1 : 0 } };
    const before = clone(original), f = fixture(), t = testing(); let publishes = 0;
    const report = await api.observe(original, {
      analyze: async () => { if (fault === "analysis") throw new Error("fixture: acquisition/analysis failed"); return await api.analyze(f.observations,f.authority,t.port); },
      publish: async (report) => { publishes++; assert.deepEqual(report.original,before); if (fault === "publish") throw new Error("fixture: report storage unavailable"); },
    });
    assert.deepEqual(original,before); assert.deepEqual(report.original,before); assert.equal(publishes,1);
    if (fault === "analysis") { assert.equal(report.observation.availability,"unknown"); code(report,"analysis-unavailable"); }
    if (fault === "publish") { assert.equal(report.delivery.availability,"unknown"); code(report,"publication-unavailable"); }
  }
});

it("engineering/timing/E17 [R5,R6]: accountable Case ownership is explicit; realization labels and skew do not imply Hosting", async () => {
  const { r } = await positive();
  assert.ok(r.advice.some((a) => a.kind === "skew" && a.accountableOwner === "Guard"));
  assert.ok(r.advice.every((a) => a.accountableOwner !== "Hosting" && a.accountableOwner !== "Engineering"));
  const f = fixture(); delete f.authority.definitions[5].accountableOwner;
  const missing = (await analyze(f)).r; code(missing,"owner-unknown");
  assert.ok(!missing.advice.some((a) => a.accountableOwner === "Hosting" || a.accountableOwner === "Engineering"));
  const bad = testing(); bad.replies.skew.challenges[0].owner = "hosting";
  const unexpected = (await analyze(fixture(),bad)).r; code(unexpected,"owner-unsupported");
  assert.ok(!unexpected.advice.some((a) => a.accountableOwner === "Hosting"));
  const malformed = testing(); malformed.replies.skew.result = "verified";
  const invalid = (await analyze(fixture(),malformed)).r;
  unknown(invalid,"skew","testing-contract");
});

it("engineering/timing/E18 [R7,R8]: observation has a declared dependency boundary and cannot become CI selection", async () => {
  await positive();
  const { inspect } = await import("kaal-hosting/conformance");
  const source = readFileSync(SUBJECT);
  const permitted = await inspect({ "analyze.mjs": source }, { builtins: [] });
  assert.deepEqual(permitted.violations,[]); assert.deepEqual(permitted.outside,[]); assert.deepEqual(permitted.validation,[]);
  const prohibited = await inspect({ "analyze.mjs": Buffer.concat([Buffer.from('import fs from "node:fs";\n'),source]) }, { builtins: [] });
  assert.ok(prohibited.violations.some((v) => v.builtin === "node:fs"));
  const undecidable = await inspect({ "analyze.mjs": Buffer.from('export const x = () => process.getBuiltinModule("fs");') }, { builtins: [] });
  assert.ok(undecidable.validation.length > 0);
  const f = fixture(); f.authority.policy.selection = { omit: ["Guard (Windows)"] };
  const t = testing(); t.port.select = () => assert.fail("observation must never call a selector");
  const { r } = await analyze(f,t); code(r,"selection-out-of-scope");
  for (const key of ["selectedChecks","omittedChecks","skipCases","requiredChecks"]) assert.ok(!(key in r));
});
