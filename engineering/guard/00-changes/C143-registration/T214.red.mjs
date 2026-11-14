// Case guard/T214 tests: F47
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, owner, rev, reg, scratch } from './lib.mjs';
export const id = 'guard/T214';
export const tests = ['guard/F47'];
export const title = 'a pull request may register only for an owner whose tree it changes other than by the registration, judged by the ownership the base holds: a cross-owner addition, and an addition that first alters the ownership, are cannot judge';
export function run() {
  const dir = scratch({ ...baseline, ...owner('alpha'), ...owner('beta'), 'packages/alpha/a.txt': '1\n' });
  try {
    const base = rev(dir, 'HEAD');
    // The pull request changes only alpha and registers for beta.
    commit(dir, { 'packages/alpha/a.txt': '2\n', ...reg('beta', 'cross') });
    let r = hook(dir, base);
    assert.equal(r.status, 2, `a cross-owner addition was not cannot judge: ${r.status} ${r.out}`);
    assert.ok(!r.out.includes('RAN cross'), 'the cross-owner registration ran');
    assert.match(r.out, /beta/, 'the refusal does not name the owner it was not entitled to');
    // The pull request widens alpha's ownership to beta's tree so that its registration for beta would look its own.
    commit(dir, { 'packages/alpha/ownership.kaal.json': JSON.stringify({ owner: { kind: 'capability', name: 'alpha' }, paths: ['packages/alpha/', 'packages/beta/'] }) });
    r = hook(dir, base);
    assert.equal(r.status, 2, `an addition that altered the ownership first was not cannot judge: ${r.status} ${r.out}`);
    assert.ok(!r.out.includes('RAN cross'), 'the registration ran under altered ownership');
    // A change to its own capability still registers for itself.
    const dir2 = scratch({ ...baseline, ...owner('alpha'), 'packages/alpha/a.txt': '1\n' });
    try {
      const b2 = rev(dir2, 'HEAD');
      commit(dir2, { 'packages/alpha/a.txt': '2\n', ...reg('alpha', 'own') });
      r = hook(dir2, b2);
      assert.ok(r.out.includes('RAN own') && r.status === 0, `a registration for the capability the pull request changes did not run: ${r.out}`);
    } finally { cleanup(dir2); }
  } finally { cleanup(dir); }
}
