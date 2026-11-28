// Judges whether a control that claims `tested` has the evidence it declared as its minimum. It reads the declared
// `evidence` of the finder and the records of Case runs given to it, and says PASS, or UNKNOWN: missing evidence is never a pass.
// Pure: it reads no file and runs no command.
import { findControls } from './find-controls.mjs';

// Evidence is a Test Case run against an X. A record is { case, x, run, outcome, by } where `case` is the id of a Case that tests the
// control (its first line `// Case <id> tests: <control id>`), `x` is the kind of thing it ran against (a fixture, a real merge,
// a provoked failure, a before/after pair of trees, any word the control declares), `run` identifies the run and `outcome` is
// GREEN, RED or UNKNOWN as a Case runner reports it. Only GREEN counts, each run once. A kind marked `fail` is an X that is a
// real failure, so a GREEN Case on it means the control rightly caught it.
export function judgeEvidence(control, records = []) {
  if (!control.evidence?.length) return { id: control.id, verdict: 'UNKNOWN', reason: 'no-minimum', met: [], missing: [], notGreen: [] };
  const own = new Set((control.tests ?? []).map((t) => t.id));
  const all = records.filter((r) => own.has(r.case));
  // A record says who or what recorded it; one that does not is listed and counts nowhere.
  const unrecorded = all.filter((r) => !String(r.by ?? '').trim());
  const mine = all.filter((r) => String(r.by ?? '').trim());
  // A run that was not GREEN keeps the claim unproven until it is explained (`handled`); an explained one counts toward no kind.
  const unhandled = mine.filter((r) => r.outcome !== 'GREEN' && !r.handled);
  const handledRuns = mine.filter((r) => r.outcome !== 'GREEN' && r.handled);
  const notGreen = mine.filter((r) => r.outcome !== 'GREEN').map((r) => ({ case: r.case, x: r.x, run: r.run, outcome: r.outcome }));
  const met = [];
  const missing = [];
  for (const { kind, runs, fail } of control.evidence) {
    // A kind marked `fail` counts only as the runner's own base/head comparison shows it: the base run RED, a different run, the head GREEN.
    const caught = (r) => !fail || (r.base?.outcome === 'RED' && r.base.run != null && String(r.base.run) !== String(r.run));
    const have = new Set(mine.filter((r) => r.x === kind && r.outcome === 'GREEN' && caught(r)).map((r) => String(r.run)));
    (have.size >= runs ? met : missing).push({ kind, runs, have: have.size, fail });
  }
  const extra = { unrecorded, unhandled, handledRuns };
  if (!mine.length) return { id: control.id, verdict: 'UNKNOWN', reason: 'no-records', met, missing, notGreen, ...extra };
  if (unhandled.length) return { id: control.id, verdict: 'UNKNOWN', reason: 'unhandled', met, missing, notGreen, ...extra };
  return { id: control.id, verdict: missing.length ? 'UNKNOWN' : 'PASS', reason: missing.length ? 'below-minimum' : 'met', met, missing, notGreen, ...extra };
}

// The state the package can show for a control: `tested` only when its declared minimum is shown, `designed` for any other valid
// control, `invalid` for one that fails validation. Implemented and running are not observed here, so they are never computed.
export function computedState(control, verdict) {
  if (!control.valid) return 'invalid';
  return verdict.verdict === 'PASS' ? 'tested' : 'designed';
}

// One line for a control: what it claims, what is computed, and how far each declared kind of X has come.
export function stateLine(control, verdict) {
  const seen = [...verdict.met, ...verdict.missing];
  const progress = control.evidence.map((e) => { const s = seen.find((x) => x.kind === e.kind); return `${e.kind} ${s ? s.have : 0}/${e.runs}${e.fail ? ' fail' : ''}`; });
  return [control.id, `claimed ${control.status}`, `computed ${computedState(control, verdict)}`, ...progress, `${verdict.verdict} ${verdict.reason}`, ...(verdict.unhandled?.length ? [`${verdict.unhandled.length} unhandled`] : [])].join(' · ');
}

// The text of a records file (one record or a list of records) as a list. The caller reads the file.
export function parseRecords(text) {
  const v = JSON.parse(text);
  return Array.isArray(v) ? v : [v];
}
