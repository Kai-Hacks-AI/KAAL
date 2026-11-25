#!/usr/bin/env node
// Applies a mode to the answer of a check. Pure: it knows no repository, path or tool.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { judgeRun } from './ratchet.mjs';
export { applyBaseline } from './ratchet.mjs';
const MODES = ['detective', 'preventive', 'ratchet'];
export function judgeMode({ mode, findings, baseline, previous } = {}) {
  if (!MODES.includes(mode)) return { mode, verdict: 'UNKNOWN', blocked: true, reason: 'no-mode' };
  const blocking = mode === 'preventive' || mode === 'ratchet';
  if (!Array.isArray(findings)) return { mode, verdict: 'UNKNOWN', blocked: blocking, reason: 'could-not-judge' };
  if (mode === 'detective') return { mode, verdict: findings.length ? 'REPORT' : 'PASS', blocked: false, findings };
  if (mode === 'preventive') return { mode, verdict: findings.length ? 'FAIL' : 'PASS', blocked: findings.length > 0, findings };
  return judgeRun({ findings, baseline, previous });
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
