#!/usr/bin/env node
// Judges whether a control that claims `tested` has the evidence it declared as its minimum. It reads the declared
// `evidence` of the finder and the records of Case runs given to it, and says PASS, or UNKNOWN: missing evidence is never a pass.
//
//   node evidence.mjs <directory> [--records <file.json|directory>]   prints the verdict of each control that claims tested
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findControls } from './find-controls.mjs';

// Evidence is a Test Case run against an X. A record is { case, x, run, outcome } where `case` is the id of a Case that tests the
// control (its first line `// Case <id> tests: <control id>`), `x` is the kind of thing it ran against (a fixture, a real merge,
// a provoked failure, a before/after pair of trees, any word the control declares), `run` identifies the run and `outcome` is
// GREEN, RED or UNKNOWN as a Case runner reports it. Only GREEN counts, each run once. A kind marked `fail` is an X that is a
// real failure, so a GREEN Case on it means the control rightly caught it.
export function judgeEvidence(control, records = []) {
  if (!control.evidence?.length) return { id: control.id, verdict: 'UNKNOWN', reason: 'no-minimum', met: [], missing: [], notGreen: [] };
  const own = new Set((control.tests ?? []).map((t) => t.id));
  const mine = records.filter((r) => own.has(r.case));
  const notGreen = mine.filter((r) => r.outcome !== 'GREEN').map((r) => ({ case: r.case, x: r.x, run: r.run, outcome: r.outcome }));
  const met = [];
  const missing = [];
  for (const { kind, runs, fail } of control.evidence) {
    // A kind marked `fail` counts only as the runner's own base/head comparison shows it: the base run RED, a different run, the head GREEN.
    const caught = (r) => !fail || (r.base?.outcome === 'RED' && r.base.run != null && String(r.base.run) !== String(r.run));
    const have = new Set(mine.filter((r) => r.x === kind && r.outcome === 'GREEN' && caught(r)).map((r) => String(r.run)));
    (have.size >= runs ? met : missing).push({ kind, runs, have: have.size, fail });
  }
  if (!mine.length) return { id: control.id, verdict: 'UNKNOWN', reason: 'no-records', met, missing, notGreen };
  return { id: control.id, verdict: missing.length ? 'UNKNOWN' : 'PASS', reason: missing.length ? 'below-minimum' : 'met', met, missing, notGreen };
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
  return [control.id, `claimed ${control.status}`, `computed ${computedState(control, verdict)}`, ...progress, `${verdict.verdict} ${verdict.reason}`].join(' · ');
}

export function readRecords(path) {
  const one = (p) => { const v = JSON.parse(readFileSync(p, 'utf8')); return Array.isArray(v) ? v : [v]; };
  if (!statSync(path).isDirectory()) return one(path);
  return readdirSync(path).filter((n) => n.endsWith('.json')).sort().flatMap((n) => one(join(path, n)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const i = a.indexOf('--records');
  const records = i >= 0 ? readRecords(a[i + 1]) : [];
  const dir = a.filter((x, j) => x !== '--json' && (i < 0 || (j !== i && j !== i + 1)))[0] ?? '.';
  const files = [];
  const walk = (d) => { for (const n of readdirSync(d)) { if (n === 'node_modules' || n === '.git') continue; const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (/\.(md|mjs)$/.test(n)) files.push({ path: p, text: readFileSync(p, 'utf8') }); } };
  walk(dir);
  const found = findControls(files).controls.filter((c) => c.evidence?.length);
  const out = found.map((c) => ({ control: c, verdict: judgeEvidence(c, records) }));
  if (a.includes('--json')) console.log(JSON.stringify(out.map((o) => o.verdict), null, 2));
  else for (const o of out) console.log(stateLine(o.control, o.verdict));
  process.exit(out.every((o) => o.control.status !== 'tested' || o.verdict.verdict === 'PASS') ? 0 : 1);
}
