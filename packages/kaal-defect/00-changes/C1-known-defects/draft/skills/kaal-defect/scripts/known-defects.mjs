#!/usr/bin/env node
// known-defects: judge run results against a register of known Defects. Pure judge; the CLI reads three inputs.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function judge(register, defects, results) {
  const defectIds = defects;
  const out = [];
  const byCase = new Map(results.map((r) => [r.case, r.outcome]));
  const registered = new Set();
  for (const e of register) {
    if (!defectIds.has(e.defect)) { out.push({ case: e.case, defect: e.defect, verdict: 'invalid' }); continue; }
    registered.add(e.case);
    const o = byCase.get(e.case);
    out.push({ case: e.case, defect: e.defect, verdict: o === 'fail' ? 'known' : o === 'pass' ? 'fixed' : 'unknown' });
  }
  for (const r of results) if (r.outcome === 'fail' && !registered.has(r.case)) out.push({ case: r.case, verdict: 'blocking' });
  return out;
}
export const blocks = (v) => v.verdict !== 'known';
export function toFix(register, fixOf) {
  const g = {};
  for (const e of register) (g[fixOf.get(e.defect) ?? e.defect.split('/')[0]] ??= []).push(e.defect);
  return g;
}
function defectIds(dir) {
  const ids = new Set(); ids.fix = new Map(); // placed by Architecture
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) { if (n !== 'node_modules' && n !== '.git') walk(p); } else if (/\/14-defects\/[^/]+\.md$/.test(p)) { const m = readFileSync(p, 'utf8').match(/^id:\s*(\S+)\s*$/m); if (m) { ids.add(m[1]); const f = readFileSync(p, 'utf8').match(/^placed:\s*(.+?)\s*$/m); if (f) ids.fix.set(m[1], f[1]); } } } };
  walk(dir); return ids;
}
if (process.argv[1] && process.argv[1].endsWith('known-defects.mjs')) {
  const a = process.argv.slice(2); const opt = (k) => a[a.indexOf(k) + 1];
  const register = JSON.parse(readFileSync(opt('--register'), 'utf8'));
  const ids = defectIds(opt('--defects'));
  if (a.includes('--list')) { for (const [o, ds] of Object.entries(toFix(register, ids.fix))) console.log(`${o}: ${ds.join(', ')}`); process.exit(0); }
  const v = judge(register, ids, JSON.parse(readFileSync(opt('--results'), 'utf8')));
  for (const x of v) console.log(`${x.verdict} ${x.case}`);
  process.exit(v.some(blocks) ? 1 : 0);
}
