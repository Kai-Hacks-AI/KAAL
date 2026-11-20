#!/usr/bin/env node
// known-defects: derive, per Defect, what Test Case observations show at one revision, and which Defects are registered.
// A Defect holds no state. `registered` is membership of a register; the observation is derived each time, never stored. Evidence, not policy.
// A register is `known.json` in a `14-defects` folder; its entries point at Defect records in the same folder.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const OUTCOME = new Set(['pass', 'fail', 'unknown']);
/**
 * entries: register entries { defect, case, exists }; observations: [{ case, outcome, revision }]; revision: the revision judged.
 * A Case is applicable only when its observation names that revision; any other, missing or incomplete observation is unknown.
 * A Defect with several connected Cases: reproduced if any applicable Case fails; not reproduced only if every connected Case
 * applicably passes; otherwise unknown.
 */
export function observe(entries, observations, revision) {
  const byCase = new Map(observations.map((o) => [o.case, o]));
  const outcomeOf = (c) => {
    const o = byCase.get(c);
    if (!o || o.revision !== revision || !OUTCOME.has(o.outcome)) return 'unknown';
    return o.outcome;
  };
  const defects = new Map();
  const invalid = [];
  for (const e of entries) {
    if (!e.exists) { invalid.push({ case: e.case, defect: e.defect }); continue; }
    (defects.get(e.defect) ?? defects.set(e.defect, []).get(e.defect)).push(e.case);
  }
  const out = [];
  for (const [defect, cases] of defects) {
    const o = cases.map(outcomeOf);
    out.push({ defect, registered: true, observation: o.includes('fail') ? 'reproduced' : o.every((x) => x === 'pass') ? 'not reproduced' : 'unknown' });
  }
  const listed = new Set(entries.map((e) => e.case));
  const unregistered = observations.filter((o) => o.outcome === 'fail' && o.revision === revision && !listed.has(o.case)).map((o) => o.case);
  return { defects: out, invalid, unregistered };
}
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
  const r = observe(entries, JSON.parse(readFileSync(opt('--results'), 'utf8')), opt('--revision'));
  for (const d of r.defects) console.log(`${d.observation} ${d.defect} registered`);
  for (const c of r.unregistered) console.log(`reproduced unregistered ${c}`);
  for (const i of r.invalid) console.log(`invalid ${i.case}`);
}
