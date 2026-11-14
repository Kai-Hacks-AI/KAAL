// Case guard/T210 tests: F44
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, rev, reg, scratch } from './lib.mjs';
export const id = 'guard/T210';
export const tests = ['guard/F44'];
export const title = 'a pull request may add a registration for itself, but deleting or weakening one the base holds is cannot judge, naming it, and its check never runs';
export function run() {
  const dir = scratch({ ...baseline, ...reg('demo', 'held') });
  try {
    const base = rev(dir, 'HEAD');
    // Adding: runs.
    commit(dir, reg('demo', 'added'));
    let r = hook(dir, base);
    assert.ok(r.out.includes('RAN added') && r.out.includes('RAN held'), `an added registration did not run beside the held one: ${r.out}`);
    assert.equal(r.status, 0, r.out);
    // Deleting a base registration: cannot judge (exit 2), the candidate cannot switch off the check that judges it.
    commit(dir, { '.kaal/guard/registered/demo/held.md': null });
    r = hook(dir, base);
    assert.equal(r.status, 2, `a deleted registration was not cannot judge: ${r.status} ${r.out}`);
    assert.match(r.out, /held/, 'the refusal does not name the registration');
    // Weakening: the candidate keeps the file but swaps its command.
    commit(dir, reg('demo', 'held', ''));
    commit(dir, { '.kaal/guard/registered/demo/held.md': '---\ntype: Guard/Check\ncommand: node -e 0\nruns: [hook]\ncapability: demo\n---\nweakened\n' });
    r = hook(dir, base);
    assert.equal(r.status, 2, `a weakened registration was not cannot judge: ${r.status} ${r.out}`);
    assert.ok(!r.out.includes('RAN held'), 'the base registration ran from the candidate');
  } finally { cleanup(dir); }
}
