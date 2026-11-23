#!/usr/bin/env node
// Applies a mode to the answer of a check. Pure: it knows no repository, path or tool.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const MODES = ['detective', 'preventive', 'ratchet'];
const names = (x) => Array.isArray(x) && x.every((f) => typeof f === 'string' && f) && new Set(x).size === x.length;
export function judgeMode({ mode, findings, baseline, previous } = {}) {
  if (!MODES.includes(mode)) return { mode, verdict: 'UNKNOWN', blocked: true, reason: 'no-mode' };
  const blocking = mode === 'preventive' || mode === 'ratchet';
  if (!Array.isArray(findings)) return { mode, verdict: 'UNKNOWN', blocked: blocking, reason: 'could-not-judge' };
  if (mode === 'detective') return { mode, verdict: findings.length ? 'REPORT' : 'PASS', blocked: false, findings };
  if (mode === 'preventive') return { mode, verdict: findings.length ? 'FAIL' : 'PASS', blocked: findings.length > 0, findings };
  const a = applyBaseline({ findings, baseline, previous });
  if (a.unknown) return { mode, verdict: 'UNKNOWN', blocked: true, reason: a.unknown };
  const { remaining, known, stale, grew, next } = a;
  const reasons = [grew.length && 'baseline-grew', stale.length && 'stale-allowance', remaining.length && 'new-finding'].filter(Boolean);
  const spent = baseline.length === 0;
  const out = { mode, findings, known, new: remaining, stale, grew, reasons, spent, ...(spent ? { then: 'preventive' } : {}) };
  // `next` is the baseline to store, and only an accepted run carries it: a rejected run advances nothing.
  return reasons.length ? { ...out, verdict: 'FAIL', blocked: true } : { ...out, next, verdict: 'PASS', blocked: false };
}
// The ratchet is a filter in front of the verdict. The check only emits findings. This subtracts the allowance and
// keeps the allowance honest; what remains is judged like any preventive check. With an empty baseline it removes
// nothing, so dropping the ratchet means deleting this step and the baseline, and the check is not touched.
export function applyBaseline({ findings, baseline, previous } = {}) {
  if (previous === undefined || previous === null) return { unknown: 'no-reference' };
  if (!names(previous) || !names(baseline) || !names(findings)) return { unknown: 'incompatible-reference' };
  return {
    remaining: findings.filter((f) => !baseline.includes(f)),
    known: findings.filter((f) => baseline.includes(f)),
    grew: baseline.filter((f) => !previous.includes(f)),
    stale: baseline.filter((f) => !findings.includes(f)),
    next: previous.filter((f) => findings.includes(f)),
  };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const a = Object.fromEntries(process.argv.slice(2).reduce((r, x, i, v) => (x.startsWith('--') ? [...r, [x.slice(2), v[i + 1]]] : r), []));
  const read = (p) => {
    if (!p) return undefined;
    let text;
    try { text = readFileSync(p, 'utf8'); } catch { throw Object.assign(new Error(p), { reason: 'unreadable-input' }); }
    try { return JSON.parse(text); } catch { throw Object.assign(new Error(p), { reason: 'malformed-input' }); }
  };
  let r;
  try { r = judgeMode({ mode: a.mode, findings: read(a.findings) ?? null, baseline: read(a.baseline), previous: read(a.previous) }); }
  catch (e) { r = { mode: a.mode, verdict: 'UNKNOWN', blocked: true, reason: e.reason ?? 'could-not-judge', file: e.message }; }
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.verdict === 'UNKNOWN' ? 2 : r.blocked ? 1 : 0);
}
