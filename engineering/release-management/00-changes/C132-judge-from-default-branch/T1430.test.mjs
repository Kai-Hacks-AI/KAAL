// Case release/T1430 tests: release/C132
import assert from 'node:assert/strict';
import { BASELINE, judge } from '../../05-src/triggers/verify-triggers.mjs';
export const id = 'release/T1430';
export const tests = ['release/C132'];
export const title = 'a base that holds no baseline file takes the default branch\'s file as the accepted baseline and says so, the head cannot widen it, and a base whose file is unreadable, a head without a file, or a missing fallback is UNKNOWN';
export async function run() {
  const f = (n) => `.github/workflows/${n}.yml`;
  const pr = 'on:\n  pull_request:\n'; const prt = 'on:\n  pull_request_target:\n';
  const stale = { [f('a')]: pr, [f('b')]: prt };           // a base that predates the control: no baseline file
  const head = (list, more = {}) => ({ ...stale, ...more, [BASELINE]: JSON.stringify(list) });
  const main = JSON.stringify([f('b')]);
  const sync = judge({ base: stale, head: head([f('b')]), fallback: main });
  assert.equal(sync.verdict, 'PASS'); assert.equal(sync.fromDefault, true); assert.deepEqual(sync.previous, [f('b')]);
  const wider = judge({ base: stale, head: head([f('b'), f('c')], { [f('c')]: prt }), fallback: main });
  assert.equal(wider.verdict, 'FAIL'); assert.equal(wider.next, undefined);
  assert.equal(judge({ base: stale, head: head([f('b')], { [f('c')]: prt }), fallback: main }).verdict, 'FAIL', 'a new use is new');
  // only an absent file falls back
  assert.equal(judge({ base: { ...stale, [BASELINE]: 'not json' }, head: head([f('b')]), fallback: main }).verdict, 'UNKNOWN');
  assert.equal(judge({ base: stale, head: stale, fallback: main }).verdict, 'UNKNOWN', 'a head without a baseline file is not judged');
  assert.equal(judge({ base: stale, head: head([f('b')]) }).verdict, 'UNKNOWN', 'no default branch file, no accepted baseline');
  assert.equal(judge({ base: stale, head: head([f('b')]), fallback: 'not json' }).verdict, 'UNKNOWN');
  // a base that has its file does not use the fallback
  const own = judge({ base: { ...stale, [BASELINE]: '[]' }, head: head([f('b')]), fallback: main });
  assert.equal(own.verdict, 'FAIL'); assert.equal(own.fromDefault, undefined);
}
