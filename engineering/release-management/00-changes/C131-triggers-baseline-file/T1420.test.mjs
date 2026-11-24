// Case release/T1420 tests: release/C131
import assert from 'node:assert/strict';
import { BASELINE, judge } from '../../05-src/triggers/verify-triggers.mjs';
export const id = 'release/T1420';
export const tests = ['release/C131'];
export const title = 'a pull request that removes a use takes its name out of the baseline file in the same change: with the file edited it passes and the next baseline drops it, without it the allowance is stale and it fails';
export async function run() {
  const f = (n) => `.github/workflows/${n}.yml`;
  const pr = 'on:\n  pull_request:\n'; const prt = 'on:\n  pull_request_target:\n';
  const base = { [f('a')]: pr, [f('b')]: prt, [BASELINE]: JSON.stringify([f('b')]) };
  const edited = judge({ base, head: { [f('a')]: pr, [f('b')]: pr, [BASELINE]: '[]' } });
  assert.equal(edited.verdict, 'PASS'); assert.deepEqual(edited.next, []);
  const forgot = judge({ base, head: { [f('a')]: pr, [f('b')]: pr, [BASELINE]: JSON.stringify([f('b')]) } });
  assert.equal(forgot.verdict, 'FAIL'); assert.equal(forgot.next, undefined);
  assert.match(forgot.reasons.join(' '), /b\.yml.*take it out of the baseline/);
}
