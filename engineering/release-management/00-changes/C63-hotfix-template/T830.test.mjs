// Case release/T830 tests: release/C63
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { CURRENT, REAL, chapters, draft } from './fixtures.mjs';
export const id = 'release/T830';
export const tests = ['release/C63'];
export const title = 'the HOTFIX template of release-management is equal to its draft and holds the current template followed by HOW TO WORK, and the current template is untouched';
export async function run() {
  assert.ok(existsSync(REAL), 'hotfix.md is absent from 05-src/wiring/templates');
  const real = readFileSync(REAL, 'utf8');
  assert.equal(real, `${draft()}\n`, 'the template differs from its draft');
  const current = readFileSync(CURRENT, 'utf8');
  assert.ok(real.startsWith(current.trimEnd()), 'the template does not start with the current template');
  assert.deepEqual(chapters(real), [...chapters(current), 'HOW TO WORK'], 'the chapters are not the current ones plus HOW TO WORK');
  assert.ok(!/## HOW TO WORK/.test(current), 'the current template was changed');
}
