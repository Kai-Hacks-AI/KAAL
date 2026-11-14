// Case architecture/T22 tests: architecture/F13
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { dir, read } from '../../test/lib.mjs';
export const id = 'architecture/T22';
export const tests = ['architecture/F13'];
export const title = "no identifier of this package is one the parked Architecture package defined and others cite, and the README says its ids are new";
const files = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? (n === 'node_modules' ? [] : files(p)) : [p]; });
export function run() {
  const cited = ['T2', 'T3', 'F5', 'C7'];
  for (const p of files(dir).filter((f) => /\/(F\d+|C\d+)\.md$|\/T\d+\.(test|red)\.mjs$/.test(f))) {
    const t = readFileSync(p, 'utf8');
    const m = t.match(/^id: architecture\/([A-Z]\d+)/m) || t.match(/export const id = 'architecture\/([A-Z]\d+)'/);
    if (m) assert.ok(!cited.includes(m[1]), `${p.slice(dir.length)} defines architecture/${m[1]}, an id the parked package defined and main cites`);
  }
  assert.match(read('README.md', 'the README'), /ids? .*new.*parked|parked.*not carried over/is, 'the README does not say that the ids are new');
}
