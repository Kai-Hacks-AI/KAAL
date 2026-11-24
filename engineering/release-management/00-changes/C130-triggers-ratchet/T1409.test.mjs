// Case release/T1409 tests: release/C130
import assert from 'node:assert/strict';
import { judgeHonest as judge } from '../C131-triggers-baseline-file/fixtures.mjs';
export const id = 'release/T1409';
export const tests = ['release/C130'];
export const title = 'the baseline persists as the findings of the base: an accepted run stores its next, a rejected run stores none, an improvement shrinks the allowance for ever, a rollback is growth, and a base that gained a use by a merge that skipped the check is the limit the judge cannot see';
export async function run() {
  const f = (n) => `.github/workflows/${n}.yml`;
  const pr = 'on:\n  pull_request:\n'; const prt = 'on:\n  pull_request_target:\n';
  const tree = (uses) => ({ [f('a')]: pr, ...Object.fromEntries(uses.map((n) => [f(n), prt])) });
  // accepted run: the baseline of the next pull request is the findings now on the base
  const day1 = judge({ base: tree(['b', 'c']), head: tree(['b']) });
  assert.equal(day1.verdict, 'PASS'); assert.deepEqual(day1.next, [f('b')]);
  // the base after that merge is tree(['b']); a run that brings c back is growth and fails
  const rollback = judge({ base: tree(['b']), head: tree(['b', 'c']) });
  assert.equal(rollback.verdict, 'FAIL'); assert.deepEqual(rollback.reasons, [`${f('c')} uses pull_request_target and did not on the base`]);
  // a rejected run advances nothing
  assert.equal(rollback.next, undefined);
  // improvement to zero: the exit
  const zero = judge({ base: tree(['b']), head: tree([]) });
  assert.equal(zero.verdict, 'PASS'); assert.deepEqual(zero.next, []);
  assert.equal(judge({ base: tree([]), head: tree(['b']) }).verdict, 'FAIL', 'at zero any use is new');
  // the limit: a merge that skipped the check put a use on the base, and the next run takes it as allowed
  const skipped = judge({ base: tree(['b', 'z']), head: tree(['b', 'z']) });
  assert.equal(skipped.verdict, 'PASS', 'the judge cannot see a merge that skipped the check; only a required check keeps the baseline honest');
}
