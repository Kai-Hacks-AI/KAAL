#!/usr/bin/env node
// known-defects: read the Defect registers in a tree. A register is a Defect's description plus its links to Test Cases.
// A Defect holds no state, and observing its condition belongs to another capability: nothing here reads a result.
// A register is `known.json` in a `14-defects` folder; its entries point at Defect records in the same folder.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

export function toFix(entries) {
  const g = {};
  for (const e of entries) { const l = (g[e.placed ?? e.context] ??= []); if (!l.includes(e.defect)) l.push(e.defect); }
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
  for (const e of entries) console.log(`${e.exists ? 'link' : 'invalid'} ${e.defect} ${e.case}`);
}
