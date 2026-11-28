#!/usr/bin/env node
// DEPRECATED shim: the command line of the evidence judge, kept at its old path for callers that have not moved to hosting yet.
// It is not published (package.json files). The library is lib/evidence.mjs. Delete this file when its callers read through hosting.
//
//   node evidence.mjs <directory> [--records <file.json|directory>]   prints the verdict of each control that claims tested
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findControls } from './lib/find-controls.mjs';
import { judgeEvidence, computedState, stateLine, parseRecords } from './lib/evidence.mjs';
export * from './lib/evidence.mjs';

export function readRecords(path) {
  const one = (p) => parseRecords(readFileSync(p, 'utf8'));
  if (!statSync(path).isDirectory()) return one(path);
  return readdirSync(path).filter((n) => n.endsWith('.json')).sort().flatMap((n) => one(join(path, n)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const i = a.indexOf('--records');
  const records = i >= 0 ? readRecords(a[i + 1]) : [];
  const dir = a.filter((x, j) => x !== '--json' && (i < 0 || (j !== i && j !== i + 1)))[0] ?? '.';
  const files = [];
  const walk = (d) => { for (const n of readdirSync(d)) { if (n === 'node_modules' || n === '.git') continue; const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (/\.(md|mjs)$/.test(n)) files.push({ path: p, text: readFileSync(p, 'utf8').replace(/\r\n/g, '\n') }); } };
  walk(dir);
  const found = findControls(files).controls.filter((c) => c.evidence?.length);
  const out = found.map((c) => ({ control: c, verdict: judgeEvidence(c, records) }));
  if (a.includes('--json')) console.log(JSON.stringify(out.map((o) => o.verdict), null, 2));
  else for (const o of out) console.log(stateLine(o.control, o.verdict));
  process.exit(out.every((o) => o.control.status !== 'tested' || o.verdict.verdict === 'PASS') ? 0 : 1);
}
