// Case engineering/T1581 tests: engineering/F100
import assert from 'node:assert/strict';
import { A, B, lineage, required, run as runOf } from './fixture.mjs';
export const id = 'engineering/T1581';
export const tests = ['engineering/F100'];
export const title = 'notGreen is exported and gives the reasons a head is not green on its exact commit';
export async function run() {
  const { notGreen } = await lineage();
  assert.equal(typeof notGreen, 'function', 'notGreen is exported');
  assert.deepEqual(notGreen(A, { required, runs: [runOf()] }), [], 'a newest success on this commit is green');
  assert.equal(notGreen(A, { required: [{ context: 'Promotion Source' }], runs: [] }).length, 1, 'nothing required besides the judged check');
  assert.match(notGreen(A, { required, runs: [] })[0], /no run/);
  assert.match(notGreen(A, { required, runs: [runOf({ status: 'in_progress', conclusion: null })] })[0], /pending/);
  assert.match(notGreen(A, { required, runs: [runOf({ conclusion: 'failure' })] })[0], /failure/);
  assert.match(notGreen(A, { required, runs: [runOf({ headSha: B })] })[0], /no run/, 'a run on another commit is no evidence');
  assert.match(notGreen(A, { required, runs: [runOf({ appId: 1 })] })[0], /no run/, 'a run by another app is no evidence');
  assert.match(notGreen(A, { required, runs: [runOf({ id: 1 }), runOf({ id: 2, conclusion: 'failure' })] })[0], /failure/, 'the newest run decides');
}
