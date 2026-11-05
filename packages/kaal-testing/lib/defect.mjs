// kaal-testing/defect: the Defect record definition `kaal-defect` will own, incubated in Testing (testing/C54,
// testing/F98–testing/F101, testing/N21). A record is plain data. What a record may claim is what Runs of Testing's own
// model show: pure, deterministic, reading no host, no clock and no other capability.
import { results } from "./model.mjs";

const REQUIRED = ["id", "context", "expected", "observed", "where", "status"];
const KEYS = [...REQUIRED, "obligation", "tests"];
const STATUS = ["reported", "confirmed", "answered"];

const plain = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const nonempty = (s) => typeof s === "string" && s !== "";
const name = (v) => (typeof v === "string" ? JSON.stringify(v) : String(v));

function one(record) {
  const f = [];
  if (!plain(record)) return ["a Defect record is not an object"];
  const id = name(record.id);
  for (const k of Object.keys(record)) if (!KEYS.includes(k)) f.push(`${id}: ${name(k)} is not a member of a Defect record`);
  for (const k of REQUIRED) if (!nonempty(record[k])) f.push(`${id}: ${k} is missing or empty`);
  if (nonempty(record.status) && !STATUS.includes(record.status)) f.push(`${id}: ${name(record.status)} is not a status`);
  if (Object.hasOwn(record, "obligation") && !nonempty(record.obligation)) f.push(`${id}: obligation is empty`);
  const has = Object.hasOwn(record, "tests");
  if (has && (!Array.isArray(record.tests) || !record.tests.every(nonempty))) f.push(`${id}: tests is not a list of Case identities`);
  else if (has && new Set(record.tests).size !== record.tests.length) f.push(`${id}: tests names a Case twice`);
  const tests = has && Array.isArray(record.tests) ? record.tests : [];
  if (record.status === "reported" && tests.length) f.push(`${id}: a reported Defect carries no tests`);
  if ((record.status === "confirmed" || record.status === "answered") && tests.length === 0) f.push(`${id}: a ${record.status} Defect names at least one Case in tests`);
  return f;
}

/** The findings of a Defect record, or of a list of records held together, whose ids must differ (testing/F98, testing/F99). */
export function check(record) {
  if (!Array.isArray(record)) return one(record);
  const f = record.flatMap(one);
  const seen = new Set();
  for (const r of record) {
    if (!plain(r) || !nonempty(r.id)) continue;
    if (seen.has(r.id)) f.push(`${name(r.id)}: duplicate id`);
    seen.add(r.id);
  }
  return f;
}

/** Whether `run` (or a Run beneath it) carries an outcome for `id`. */
function observes(run, id) {
  if (!plain(run)) return false;
  if (plain(run.outcomes) && Object.hasOwn(run.outcomes, id)) return true;
  return Array.isArray(run.runs) && run.runs.some((r) => observes(r, id));
}

/** The version a Run's provenance gives `id`, searching the Run and then those beneath it. */
function version(run, id) {
  if (plain(run?.provenance) && Object.hasOwn(run.provenance, id)) return { found: true, value: run.provenance[id] };
  for (const r of Array.isArray(run?.runs) ? run.runs : []) {
    const v = version(r, id);
    if (v.found) return v;
  }
  return { found: false };
}

/**
 * What the evidence shows about a record: `{ shows, findings }`, where `shows` is the status the record can claim.
 * A claim without its evidence is a finding, never accepted (testing/F100). Evidence is `{ model, runs }`, Runs of the
 * model oldest first. A Run with findings of its own shows nothing.
 */
export function state(record, evidence) {
  const findings = check(record);
  if (!plain(record)) return { shows: "reported", findings };
  const id = name(record.id);
  if (!plain(evidence) || !plain(evidence.model) || !Array.isArray(evidence.runs)) {
    findings.push(`${id}: the evidence is not { model, runs }`);
    return { shows: "reported", findings };
  }
  const tests = Array.isArray(record.tests) ? record.tests.filter(nonempty) : [];
  const seen = evidence.runs.map((run) => {
    const r = results(evidence.model, run);
    return { run, r, ok: r.findings.length === 0 };
  });
  const known = new Set((evidence.model.cases ?? []).map((c) => c?.id));
  for (const t of tests) if (!known.has(t)) findings.push(`${id}: ${name(t)} is not a Case of the model`);
  const confirmedAt = tests.length ? seen.findIndex((s) => s.ok && tests.every((t) => s.r.cases[t] === "failed")) : -1;
  let shows = "reported";
  if (confirmedAt >= 0) shows = "confirmed";
  if (record.status === "confirmed" && confirmedAt < 0) findings.push(`${id}: no one Run shows every named Case failed`);
  if (record.status === "answered") {
    if (confirmedAt < 0) findings.push(`${id}: no one Run shows every named Case failed, so nothing was confirmed`);
    else {
      let all = true;
      for (const t of tests) {
        const last = seen.map((s, i) => (s.ok && observes(s.run, t) ? i : -1)).reduce((a, b) => Math.max(a, b), -1);
        if (last <= confirmedAt || seen[last].r.cases[t] !== "passed") { all = false; findings.push(`${id}: ${name(t)} has no later passing Run as its latest observation`); continue; }
        const was = version(seen[confirmedAt].run, t);
        const now = version(seen[last].run, t);
        if (!was.found || !now.found || was.value !== now.value) { all = false; findings.push(`${id}: ${name(t)} is not identified at the same version in the confirming and answering Runs`); }
      }
      if (all) shows = "answered";
    }
  }
  return { shows, findings };
}
