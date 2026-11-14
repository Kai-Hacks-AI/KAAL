// Case architecture/T21 tests: architecture/F13
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { dir, read } from '../../test/lib.mjs';
export const id = 'architecture/T21';
export const tests = ['architecture/F13'];
export const title = "the Target holds no trial material, no Target Case reads a trial or the key or a file under 00-changes, and the historical result is preserved unrewritten";
const files = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? files(p) : [p]; });
export function run() {
  read('02-requirements/F13-enduring-target/F13.md', 'F13');
  const target = ['01-intent', '02-requirements', '03-architecture'].filter((d) => existsSync(join(dir, d))).flatMap((d) => files(join(dir, d)));
  assert.ok(!target.some((p) => p.endsWith('scenarios.json')), 'the key is still in the Target');
  for (const p of target.filter((x) => /T\d+\.test\.mjs$/.test(x) && !x.endsWith('/T21.test.mjs'))) {
    const t = readFileSync(p, 'utf8');
    assert.ok(!/00-changes|trial|scenarios/.test(t.replace(/^\/\/.*$/gm, '').replace(/title = .*$/m, '')), `${p.slice(dir.length)} reads a trial or a Change file`);
  }
  const hist = '00-changes/C1-classification/trial/';
  assert.ok(existsSync(join(dir, hist, 'historical-T3.mjs')) && existsSync(join(dir, hist, 'historical-T3.red-output.txt')), 'the historical T3 is not preserved');
  assert.ok(!existsSync(join(dir, '02-requirements/F3-mixed-and-ambiguous/T3.test.mjs')), 'T3 is still an active Target Case');
}
