// Case release/T650 tests: release/C45
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { CURRENT, REAL, chapters, draft } from './fixtures.mjs';
export const id = 'release/T650';
export const tests = ['release/C45'];
export const title = 'the SYNC template of release-management is equal to its draft and holds the chapters of the current template followed by HOW TO WORK, and the current template is untouched';
export async function run() {
  assert.ok(existsSync(REAL), 'sync.md is absent from 05-src/wiring/templates');
  const real = readFileSync(REAL, 'utf8');
  assert.equal(real.replace(/^<!-- KAAL-PR-template: [A-Z]+ -->\n/, ''), `${draft()}\n`, 'the template differs from its draft');
  const current = chapters(readFileSync(CURRENT, 'utf8'));
  assert.deepEqual(chapters(real), [...current, 'HOW TO WORK'], 'the chapters are not the current ones plus HOW TO WORK');
  assert.ok(!/## HOW TO WORK/.test(readFileSync(CURRENT, 'utf8')), 'the current template was changed');
}
