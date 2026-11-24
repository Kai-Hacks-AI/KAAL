// Case release/T1421 tests: release/C131
import assert from 'node:assert/strict';
import { BASELINE, judge } from '../../05-src/triggers/verify-triggers.mjs';
export const id = 'release/T1421';
export const tests = ['release/C131'];
export const title = 'an accepted baseline that is absent or unreadable in the base is UNKNOWN with no next, a baseline of the head that is absent or unreadable is UNKNOWN too, and one that grows the allowance fails';
export async function run() {
  const f = (n) => `.github/workflows/${n}.yml`;
  const pr = 'on:\n  pull_request:\n'; const prt = 'on:\n  pull_request_target:\n';
  const tree = (list) => ({ [f('a')]: pr, [f('b')]: prt, ...(list === undefined ? {} : { [BASELINE]: list }) });
  const ok = JSON.stringify([f('b')]);
  for (const bad of [undefined, 'not json', '{"a":1}', '["x","x"]', '[1]']) {
    const r = judge({ base: tree(bad), head: tree(ok) });
    assert.equal(r.verdict, 'UNKNOWN', `a base baseline of ${bad} must be UNKNOWN`); assert.equal(r.next, undefined);
    const h = judge({ base: tree(ok), head: tree(bad) });
    assert.equal(h.verdict, 'UNKNOWN', `a head baseline of ${bad} must be UNKNOWN`); assert.equal(h.next, undefined);
  }
  // the head cannot widen the allowance by writing more names into its own file
  const wider = judge({ base: tree(ok), head: { ...tree(JSON.stringify([f('b'), f('c')])), [f('c')]: prt } });
  assert.equal(wider.verdict, 'FAIL'); assert.equal(wider.next, undefined);
  assert.match(wider.reasons.join(' '), /c\.yml.*not in the accepted baseline of the base/);
}
