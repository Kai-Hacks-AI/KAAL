#!/usr/bin/env node
// check-defects <dir>: a Defect is proven when a Test Case names it. Reads the Test Case side only.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ID = /^[a-z][a-z0-9-]*\/D[1-9][0-9]*$/;
function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n === 'node_modules' || n === '.git') continue;
    const p = join(dir, n);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
const dir = process.argv[2];
if (!dir) { console.error('usage: check-defects <dir>'); process.exit(2); }
const files = walk(dir);
const defects = new Set();
const named = new Set();
for (const f of files) {
  if (/\/D\d+[^/]*\.md$/.test(f)) {
    const t = readFileSync(f, 'utf8');
    const m = t.match(/^id:\s*(\S+)\s*$/m) ?? t.match(/"id":\s*"([^"]+)"/);
    if (m) defects.add(m[1]);
  } else if (/\/T\d+\.(red|test)\.mjs$/.test(f)) {
    const m = readFileSync(f, 'utf8').match(/export const tests = \[([^\]]*)\]/);
    for (const id of m ? [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]) : []) named.add(id);
  }
}
let bad = 0;
for (const id of [...defects].sort()) {
  const state = !ID.test(id) ? 'invalid' : named.has(id) ? 'proven' : 'unproven';
  if (state !== 'proven') bad++;
  console.log(`${state} ${id}`);
}
process.exit(bad ? 1 : 0);
