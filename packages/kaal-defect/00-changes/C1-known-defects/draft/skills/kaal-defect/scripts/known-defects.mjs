#!/usr/bin/env node
// known-defects: judge run results against the known-Defect registers found in a tree.
// A register is `known.json` in a `14-defects` folder; its entries point at Defect records in the same folder.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

export function judge(entries, results) {
  const out = [];
  const byCase = new Map(results.map((r) => [r.case, r.outcome]));
  const registered = new Set();
  for (const e of entries) {
    if (!e.exists) { out.push({ case: e.case, defect: e.defect, verdict: 'invalid' }); continue; }
    registered.add(e.case);
    const o = byCase.get(e.case);
    out.push({ case: e.case, defect: e.defect, verdict: o === 'fail' ? 'known' : o === 'pass' ? 'fixed' : 'unknown' });
  }
  for (const r of results) if (r.outcome === 'fail' && !registered.has(r.case)) out.push({ case: r.case, verdict: 'blocking' });
  return out;
}
export const blocks = (v) => v.verdict !== 'known';
export function toFix(entries) {
  const g = {};
  for (const e of entries) (g[e.placed ?? e.context] ??= []).push(e.defect);
  return g;
}
// every register in the tree, with each entry's Defect looked up in the same 14-defects folder
export function readRegisters(root) {
  const entries = [];
  const walk = (d) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) { if (n !== 'node_modules' && n !== '.git') walk(p); continue; }
      if (n !== 'known.json' || !p.endsWith('/14-defects/known.json')) continue;
      const dir = dirname(p);
      const context = relative(root, dirname(dir)) || '.';
      for (const e of JSON.parse(readFileSync(p, 'utf8'))) {
        const rec = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8')).find((t) => new RegExp(`^id:\\s*${e.defect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').test(t));
        entries.push({ ...e, context, exists: Boolean(rec), placed: rec?.match(/^placed:\s*(.+?)\s*$/m)?.[1] });
      }
    }
  };
  walk(root);
  return entries;
}
if (process.argv[1] && process.argv[1].endsWith('known-defects.mjs')) {
  const a = process.argv.slice(2); const opt = (k) => a[a.indexOf(k) + 1];
  const entries = readRegisters(opt('--root'));
  if (a.includes('--list')) { for (const [o, ds] of Object.entries(toFix(entries))) console.log(`${o}: ${ds.join(', ')}`); process.exit(0); }
  const v = judge(entries, JSON.parse(readFileSync(opt('--results'), 'utf8')));
  for (const x of v) console.log(`${x.verdict} ${x.case}`);
  process.exit(v.some(blocks) ? 1 : 0);
}
