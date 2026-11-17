// Case release/T680 tests: release/C51
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { CUE, REAL, chapters, draft } from './fixtures.mjs';
export const id = 'release/T680';
export const tests = ['release/C51'];
export const title = 'the WIRE template of release-management is equal to its draft, opens with the envelope cue once and holds the chapters Source, Target, Verification and HOW TO WORK in this order';
export async function run() {
  assert.ok(existsSync(REAL), 'wire.md is absent from 05-src/wiring/templates');
  const real = readFileSync(REAL, 'utf8');
  assert.equal(real, `${draft()}\n`, 'the template differs from its draft');
  assert.deepEqual(chapters(real), ['Source', 'Target', 'Verification', 'HOW TO WORK'], 'the chapters are not Source, Target, Verification and HOW TO WORK');
  assert.equal(real.split('\n').filter((l) => l === CUE).length, 1, 'the envelope cue is not there exactly once');
}
