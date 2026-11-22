#!/usr/bin/env node
// Applies a mode to the answer of a check. Pure: it knows no repository, path or tool.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const MODES = ['detective', 'advisory', 'preventive', 'ratchet'];
const names = (x) => Array.isArray(x) && x.every((f) => typeof f === 'string' && f) && new Set(x).size === x.length;
export function judgeMode({ mode, findings, baseline, previous } = {}) {
  if (!MODES.includes(mode)) return { mode, verdict: 'UNKNOWN', blocked: false, reason: 'no-mode' };
  const blocking = mode === 'preventive' || mode === 'ratchet';
  if (!Array.isArray(findings)) return { mode, verdict: 'UNKNOWN', blocked: blocking, reason: 'could-not-judge' };
  if (mode === 'detective') return { mode, verdict: findings.length ? 'REPORT' : 'PASS', blocked: false, findings };
  if (mode === 'advisory') return { mode, verdict: findings.length ? 'WARN' : 'PASS', blocked: false, findings };
  if (mode === 'preventive') return { mode, verdict: findings.length ? 'FAIL' : 'PASS', blocked: findings.length > 0, findings };
  const unknown = (reason) => ({ mode, verdict: 'UNKNOWN', blocked: true, reason });
  if (previous === undefined || previous === null) return unknown('no-reference');
  if (!names(previous) || !names(baseline) || !names(findings)) return unknown('incompatible-reference');
  const grew = baseline.filter((f) => !previous.includes(f));
  const stale = baseline.filter((f) => !findings.includes(f));
  const known = findings.filter((f) => baseline.includes(f));
  const fresh = findings.filter((f) => !baseline.includes(f));
  const reasons = [grew.length && 'baseline-grew', stale.length && 'stale-allowance', fresh.length && 'new-finding'].filter(Boolean);
  const next = previous.filter((f) => findings.includes(f));
  const spent = baseline.length === 0;
  const out = { mode, findings, known, new: fresh, stale, grew, reasons, next, spent, ...(spent ? { then: 'preventive' } : {}) };
  return { ...out, verdict: reasons.length ? 'FAIL' : 'PASS', blocked: reasons.length > 0 };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const a = Object.fromEntries(process.argv.slice(2).reduce((r, x, i, v) => (x.startsWith('--') ? [...r, [x.slice(2), v[i + 1]]] : r), []));
  const read = (p) => (p ? JSON.parse(readFileSync(p, 'utf8')) : undefined);
  const r = judgeMode({ mode: a.mode, findings: read(a.findings) ?? null, baseline: read(a.baseline), previous: read(a.previous) });
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.verdict === 'UNKNOWN' ? 2 : r.blocked ? 1 : 0);
}
