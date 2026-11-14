// Case guard/T209 tests: F43
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, owner, rev, reg, scratch } from './lib.mjs';
export const id = 'guard/T209';
export const tests = ['guard/F43'];
export const title = 'a registration from each of the two origins, solution and change, with Change folders in unrelated places, is run by the unchanged hook invocation beside the declared check and is never taken for another origin; an installed copy that differs from its source, has none, or sits under another origin is cannot judge';
export function run() {
  const dir = scratch({ ...baseline, ...owner('alpha') });
  try {
    const base = rev(dir, 'HEAD');
    commit(dir, { ...reg('alpha', 'sol'), ...reg('c7', 'chg', { origin: 'change' }), ...reg('c8', 'chg8', { origin: 'change' }), ...reg('c9', 'chg9', { origin: 'change' }) });
    let r = hook(dir, base);
    assert.ok(r.out.includes('RAN declared'), `the declared check did not run: ${r.out}`);
    for (const n of ['sol', 'chg', 'chg8', 'chg9']) assert.ok(r.out.includes(`RAN ${n}`), `the ${n} registration was not run: ${r.out}`);
    assert.equal(r.status, 0, r.out);
    // Conflation: a change registration installed where a solution registration lives is refused.
    commit(dir, reg('c7', 'chg', { origin: 'change', installedAt: '.kaal/guard/registered/solution/c7/chg.md' }));
    r = hook(dir, base);
    assert.equal(r.status, 2, `a registration under another origin's path was not cannot judge: ${r.status} ${r.out}`);
    // Engineering is not an origin: a registration claiming it is cannot judge.
    commit(dir, reg('release', 'eng', { origin: 'solution', installed: reg('release', 'eng')['.kaal/guard/registered/solution/release/eng.md'].replace('origin: solution', 'origin: engineering') }));
    r = hook(dir, base);
    assert.equal(r.status, 2, `an engineering-origin registration was not cannot judge: ${r.status} ${r.out}`);
    // Provenance: an installed copy edited by hand, and one whose source is gone.
    commit(dir, reg('alpha', 'sol', { installed: '---\ntype: Guard/Check\ncommand: node -e 0\nruns: [hook]\n---\nedited by hand\n' }));
    r = hook(dir, base);
    assert.equal(r.status, 2, `an installed copy that differs from its source was not cannot judge: ${r.status} ${r.out}`);
    commit(dir, { 'packages/alpha/guard/sol.md': null });
    r = hook(dir, base);
    assert.equal(r.status, 2, `an installed registration with no source was not cannot judge: ${r.status} ${r.out}`);
  } finally { cleanup(dir); }
}
