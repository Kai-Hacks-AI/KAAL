// Case guard/T210 tests: F44
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, owner, rev, reg, scratch } from './lib.mjs';
export const id = 'guard/T210';
export const tests = ['guard/F44'];
export const title = 'a pull request may add a registration for the capability it changes, but deleting, weakening or re-owning one the base holds is cannot judge, naming it, and its check never runs';
export function run() {
  const dir = scratch({ ...baseline, ...owner('alpha'), ...reg('alpha', 'held') });
  try {
    const base = rev(dir, 'HEAD');
    commit(dir, { ...reg('alpha', 'added'), 'packages/alpha/a.txt': '1\n' });
    let r = hook(dir, base);
    assert.ok(r.out.includes('RAN added') && r.out.includes('RAN held'), `an added registration did not run beside the held one: ${r.out}`);
    assert.equal(r.status, 0, r.out);
    // Deleting a base registration, in source and installed copy: the candidate cannot switch off the check that judges it.
    commit(dir, { 'packages/alpha/guard/held.md': null, '.kaal/guard/registered/alpha/held.md': null });
    r = hook(dir, base);
    assert.equal(r.status, 2, `a deleted registration was not cannot judge: ${r.status} ${r.out}`);
    assert.match(r.out, /held/, 'the refusal does not name the registration');
    // Weakening: source and installed copy both swap the command, so they agree with each other but not with the base.
    const weak = '---\ntype: Guard/Check\ncommand: node -e 0\nruns: [hook]\ncapability: alpha\n---\nweakened\n';
    commit(dir, { 'packages/alpha/guard/held.md': weak, '.kaal/guard/registered/alpha/held.md': weak });
    r = hook(dir, base);
    assert.equal(r.status, 2, `a weakened registration was not cannot judge: ${r.status} ${r.out}`);
    // Re-owning: the member capability of a base registration changes.
    const moved = weak.replace('capability: alpha', 'capability: beta');
    commit(dir, { 'packages/alpha/guard/held.md': moved, '.kaal/guard/registered/alpha/held.md': moved });
    r = hook(dir, base);
    assert.equal(r.status, 2, `a re-owned registration was not cannot judge: ${r.status} ${r.out}`);
  } finally { cleanup(dir); }
}
