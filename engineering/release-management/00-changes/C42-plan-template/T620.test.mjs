// Case release/T620 tests: release/C42
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { CURRENT, REAL, chapters, draft } from './fixtures.mjs';
export const id = 'release/T620';
export const tests = ['release/C42'];
export const title = 'the PLAN template of release-management is equal to its draft and holds the chapters of the current template followed by HOW TO WORK, and the current template is untouched';
export async function run() {
  assert.ok(existsSync(REAL), 'plan.md is absent from 05-src/wiring/templates');
  const real = readFileSync(REAL, 'utf8');
  assert.equal(real, `${draft()}\n`, 'the template differs from its draft');
  const current = chapters(readFileSync(CURRENT, 'utf8'));
  assert.deepEqual(chapters(real), [...current, 'HOW TO WORK'], 'the chapters are not the current ones plus HOW TO WORK');
  assert.ok(!/## HOW TO WORK/.test(readFileSync(CURRENT, 'utf8')), 'the current template was changed');
}
