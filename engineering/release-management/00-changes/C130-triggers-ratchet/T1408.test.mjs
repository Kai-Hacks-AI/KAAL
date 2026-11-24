// Case release/T1408 tests: release/C130
import assert from 'node:assert/strict';
import { judge } from '../../05-src/triggers/verify-triggers.mjs';
export const id = 'release/T1408';
export const tests = ['release/C130'];
export const title = 'through the shared ratchet, adding a use, giving one to a workflow and swapping to a new workflow fail, removing, replacing and leaving a use pass and the next baseline drops it, a use put back after removal fails, and an unreadable side is UNKNOWN with no next';
export async function run() {
  const on = (e) => `on:\n  ${e}:\n`;
  const pr = on('pull_request'); const prt = on('pull_request_target');
  const f = (n) => `.github/workflows/${n}.yml`;
  const base = { [f('a')]: pr, [f('b')]: prt };
  assert.equal(judge({ base, head: { ...base, [f('c')]: prt } }).verdict, 'FAIL');
  const gained = judge({ base, head: { ...base, [f('a')]: prt } });
  assert.equal(gained.verdict, 'FAIL'); assert.match(gained.reasons.join(' '), /a\.yml/);
  assert.equal(judge({ base, head: { [f('a')]: pr, [f('c')]: prt } }).verdict, 'FAIL', 'a swap keeps the count and still fails');
  const same = judge({ base, head: base });
  assert.equal(same.verdict, 'PASS'); assert.deepEqual(same.next, [f('b')]);
  const removed = judge({ base, head: { [f('a')]: pr } });
  assert.equal(removed.verdict, 'PASS'); assert.deepEqual(removed.next, []);
  const replaced = judge({ base, head: { ...base, [f('b')]: pr } });
  assert.equal(replaced.verdict, 'PASS'); assert.deepEqual(replaced.next, []);
  // a use put back after it was removed is outside the allowance of the base
  assert.equal(judge({ base: { [f('a')]: pr }, head: base }).verdict, 'FAIL');
  const unknown = judge({ base: {}, head: base });
  assert.equal(unknown.verdict, 'UNKNOWN'); assert.equal(unknown.next, undefined);
  assert.equal(judge({ base, head: undefined }).verdict, 'UNKNOWN');
}
