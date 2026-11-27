#!/usr/bin/env node
// DEPRECATED shim: the command line of the control check, kept at its old path for callers that have not moved to hosting yet (controls/C160).
// It is not published (package.json files). The library is lib/check-controls.mjs. Delete this file when its callers read through hosting.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkControls } from './lib/check-controls.mjs';
import { parseRecords } from './lib/evidence.mjs';
export * from './lib/check-controls.mjs';
const readRecords = (path) => (statSync(path).isDirectory() ? readdirSync(path).filter((n) => n.endsWith('.json')).sort().flatMap((n) => parseRecords(readFileSync(join(path, n), 'utf8'))) : parseRecords(readFileSync(path, 'utf8')));
const gather = (d, f = []) => { for (const n of readdirSync(d)) { if (n === 'node_modules' || n === '.git') continue; const p = join(d, n); if (statSync(p).isDirectory()) gather(p, f); else if (/\.(md|mjs|json)$/.test(n) && n !== 'package-lock.json') f.push({ path: p, text: readFileSync(p, 'utf8').replace(/\r\n/g, '\n') }); } return f; };
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const i = a.indexOf('--records');
  const r = checkControls(gather(a.filter((x, j) => i < 0 || (j !== i && j !== i + 1))[0] ?? '.'), i >= 0 ? readRecords(a[i + 1]) : null);
  for (const c of r.controls) console.log(`${c.id} ${c.status ?? 'none'} ${c.valid ? 'valid' : 'invalid'} ${c.path}`);
  for (const p of r.problems) console.error(`${p.path}: ${p.id}: ${p.reason}\n  ${p.recovery}`);
  process.exit(r.ok ? 0 : 1);
}
