// PLAN-owned data and owner-interface doubles. No recorder, statistics or candidate code.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

export const H1 = "a".repeat(64), H2 = "b".repeat(64), PRODUCER = "c".repeat(40);
const REV = (id, offset = 0) => (Number(id) + offset).toString(16).padStart(40,"0"); // synthetic Git identities, not computed digests
export const HOSTS = ["linux", "darwin", "win32"];
export const COHORT = "guard-engineering-acceptance/normal/1";
export const KEY = (id) => `Guard::Engineering acceptance::${id}`;
export const clone = (value) => structuredClone(value);
export const legacySource = JSON.parse(readFileSync(new URL("./fixtures/source-evidence.json", import.meta.url), "utf8"));

export function fixture() {
  const definitions = Array.from({ length: 6 }, (_, i) => ({
    key: KEY(`guard/T${i + 1}`), id: `guard/T${i + 1}`, suite: "Engineering acceptance",
    file: i >= 4 ? "cases/shared.test.mjs" : `cases/t${i + 1}.test.mjs`,
    version: H1, accountableOwner: "Guard", targets: ["guard/F1"],
  }));
  const authority = {
    original: { result: "passed", exit: 0, completeness: "complete", cases: { passed: 6, failed: 0, notRun: 0 } },
    current: { run: "103", attempt: 1, candidate: REV("103") },
    policy: {
      id: "timing-policy/1", cohort: COHORT, hosts: [...HOSTS], suite: "Engineering acceptance",
      repository: "Kai-Hacks-AI/KAAL", workflow: ".github/workflows/ci.yml", event: "pull_request", stream: "trial/approved-family",
      producer: { schema: "guard-run-timing/1", revision: PRODUCER },
      timing: {}, redesign: { window: 5, recur: 3 },
      configuration: { node: "v24.22.1", instrumentation: "normal", concurrency: 1, testData: H1, fixtureVersion: H1 },
      runners: Object.fromEntries(HOSTS.map((h) => [h, { runnerClass: `approved-${h}`, arch: "x64" }])),
    },
    enumeration: { first: "page-1", pages: [{ id: "page-1", runs: ["101", "102", "103"], next: null }] },
    runs: ["101", "102", "103"].map((id, i) => ({ id, ordinal: i + 1, latestAttempt: 1, candidate: REV(id), head: REV(id,1000), base: REV(id,2000) })),
    definitions, bindings: {}, preservationBindings: {},
  };
  const records = [];
  for (const run of authority.runs) for (const host of HOSTS) {
    const ref = `${run.id}/1/${host}`;
    const config = { node: "v24.22.1", arch: "x64", runnerClass: `approved-${host}`, instrumentation: "normal", concurrency: 1, testData: H1, fixtureVersion: H1 };
    const binding = {
      ref, repository: authority.policy.repository, run: run.id, attempt: 1, job: `${run.id}-${host}`, host,
      candidate: run.candidate, head: run.head, base: run.base,
      workflow: authority.policy.workflow, event: authority.policy.event, stream: authority.policy.stream,
      artifact: `artifact-${ref}`, digest: H1, producer: clone(authority.policy.producer), cohort: COHORT, config,
      expectedCases: definitions.map((d) => ({ ...clone(d), version: H1 })), integrity: "verified-by-trusted-reader", expired: false,
    };
    authority.bindings[ref] = binding;
    records.push({ ref, digest: H1, body: {
      schema: "guard-run-timing/1", producer: { revision: PRODUCER }, candidate: run.candidate, host, node: config.node,
      suites: [{ owner: "Engineering", name: "Engineering acceptance", status: "passed", files: [...new Set(definitions.map((d) => d.file))] }],
      cases: definitions.map((d, i) => ({
        case: d.id, owner: "Engineering", suite: d.suite, file: d.file, outcome: "passed",
        timing: { ms: i === 5 ? host === "win32" ? 45000 : 9000 : i === 0 ? Number(run.id) : 100, unit: "ms", scope: "case", event: `event-${ref}-${i + 1}`, occurrences: 1,
          fileVersion: { before: H1, executed: H1, after: H1 } },
      })),
    } });
  }
  return { observations: { records, preservation: [] }, authority };
}

export function timingRow({ shown = "faster", key = KEY("guard/T6"), from = H1, to = H2 } = {}) {
  return { case: key, platform: "linux", from, to, beforeMs: 9000, afterMs: shown === "not faster" ? 9000 : 100, runs: shown === "pending" ? 1 : 3, shown };
}

export function preservation(f, { result = "kept", shown = "faster" } = {}) {
  // Give this Case an independent file in this fixture; E11 uses the shared-file base.
  for (const d of f.authority.definitions.filter((d) => d.id === "guard/T6")) { d.file = "cases/redesign.test.mjs"; d.version = H2; }
  for (const r of f.observations.records) {
    r.body.cases.find((c) => c.case === "guard/T6").file = "cases/redesign.test.mjs";
    f.authority.bindings[r.ref].expectedCases.find((d) => d.id === "guard/T6").file = "cases/redesign.test.mjs";
  }
  const templates = f.observations.records.filter((r) => f.authority.bindings[r.ref].run === "103");
  const newIds = shown === "pending" ? ["104"] : ["104", "105", "106"];
  for (const id of newIds) {
    f.authority.runs.push({ id, ordinal: Number(id) - 100, latestAttempt: 1, candidate: REV(id), head: REV(id,1000), base: REV(id,2000) });
    f.authority.enumeration.pages[0].runs.push(id);
    for (const old of templates) {
      const host = old.body.host, ref = `${id}/1/${host}`;
      const record = clone(old), binding = clone(f.authority.bindings[old.ref]);
      record.ref = ref; record.body.candidate = REV(id);
      Object.assign(binding, { ref, run: id, job: `${id}-${host}`, candidate: REV(id), head: REV(id,1000), base: REV(id,2000), artifact: `artifact-${ref}` });
      for (const c of record.body.cases) c.timing.event = `event-${ref}-${c.case}`;
      const c = record.body.cases.find((c) => c.case === "guard/T6");
      c.timing.ms = shown === "not faster" ? 9000 : 100;
      c.timing.fileVersion = { before: H2, executed: H2, after: H2 };
      binding.expectedCases.find((d) => d.id === "guard/T6").version = H2;
      f.observations.records.push(record); f.authority.bindings[ref] = binding;
    }
  }
  const latest = newIds.at(-1); f.authority.current = { run: latest, attempt: 1, candidate: REV(latest) };
  const key = KEY("guard/T6"), ref = "case-change/preservation-1";
  const before = { id: key, version: H1, tests: ["guard/F1"], verdicts: { candidate: "pass", mutant: "fail" } };
  const after = { ...clone(before), version: H2 };
  if (result === "changed") after.verdicts.mutant = "pass";
  if (result === "unknown") delete before.verdicts.mutant;
  const subjects = { candidate: { bytes: H1, data: H1 }, mutant: { bytes: H2, operator: "negate-guard", data: H1 } };
  f.observations.preservation.push({ ref, case: key, from: H1, to: H2, cohort: COHORT, before, after, subjects: clone(subjects) });
  f.authority.preservationBindings[ref] = { case: key, from: H1, to: H2, cohort: COHORT, subjects, producer: "approved-case-owner-evaluation/1", targets: { before: ["guard/F1"], after: ["guard/F1"] }, integrity: "verified-by-trusted-reader" };
  return timingRow({ shown });
}

/** Public-interface doubles: responses are owner-contract examples, never computed statistics. */
export function testing({ rows = [], behaviour = { result: "kept", differences: [], findings: [] }, history, fail } = {}) {
  const calls = { profile: [], skew: [], candidates: [], refactored: [] };
  const challenge = { kind: "outlier", owner: "case owner", case: KEY("guard/T6"), ms: 9000, median: 100, statement: "owner-provided outlier example", next: "investigate the Case" };
  const replies = {
    profile: rows.length && rows[0].shown !== "not faster" ? { result: "unchallenged", challenges: [], findings: [] } : { result: "challenged", challenges: [challenge], findings: [] },
    skew: rows.length ? { result: "unchallenged", challenges: [], findings: [] } : { result: "challenged", challenges: [{ ...challenge, kind: "skew", platform: "win32", ms: 45000, others: 9000 }], findings: [] },
    candidates: history ?? { result: rows.length && rows[0].shown !== "not faster" ? "unchallenged" : "challenged", candidates: rows.length && rows[0].shown !== "not faster" ? [] : [{ kind: "redesign", case: KEY("guard/T6"), version: rows[0]?.to ?? H1, platform: "linux", seen: 3, of: 3, signals: { concentration: 3, outlier: 3 }, medianMs: 9000, owner: "case owner", statement: "owner-provided recurring example", next: "redesign the Case" }], refactors: rows, unprofiled: [], findings: [] },
    refactored: behaviour,
  };
  const port = Object.fromEntries(Object.keys(calls).map((name) => [name, (...args) => {
    calls[name].push(clone(args));
    if (fail === name) throw new Error(`simulated ${name} failure`);
    return clone(replies[name]);
  }]));
  return { port, calls, replies };
}

export function dropRun(f, run) {
  f.authority.runs = f.authority.runs.filter((r) => r.id !== run);
  for (const page of f.authority.enumeration.pages) page.runs = page.runs.filter((id) => id !== run);
  f.observations.records = f.observations.records.filter((r) => f.authority.bindings[r.ref].run !== run);
}

export function setLatestVersion(f) {
  for (const d of f.authority.definitions.filter((d) => d.file === "cases/shared.test.mjs")) d.version = H2;
  for (const record of f.observations.records.filter((r) => f.authority.bindings[r.ref].run === "103")) {
    for (const c of record.body.cases.filter((c) => c.file === "cases/shared.test.mjs")) c.timing.fileVersion = { before: H2, executed: H2, after: H2 };
    for (const d of f.authority.bindings[record.ref].expectedCases.filter((d) => d.file === "cases/shared.test.mjs")) d.version = H2;
  }
}

export function checkFixtures() {
  const f = fixture();
  assert.equal(f.observations.records.length, 9);
  assert.equal(f.authority.definitions.length, 6);
  assert.equal(new Set(f.authority.definitions.map((d) => d.key)).size, 6);
  for (const r of f.observations.records) {
    const b = f.authority.bindings[r.ref];
    assert.equal(r.body.candidate, b.candidate);
    assert.equal(r.body.host, b.host);
    assert.equal(r.digest, b.digest);
    assert.equal(r.body.cases.length, b.expectedCases.length);
    for (const c of r.body.cases) assert.ok(Number.isFinite(c.timing.ms) && c.timing.ms >= 0);
  }
  assert.equal(legacySource.run, "41226277799");
  assert.equal(legacySource.hosts.length, 3);
  assert.ok(!legacySource.caseKeys.includes("timing"));
  assert.ok(!legacySource.caseKeys.includes("ms"));
  for (const h of legacySource.hosts) assert.equal(h.passed + h.notRun, 176);
}
