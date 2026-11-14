// Case guard/T209 tests: F43
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from './lib.mjs';
export const id = 'guard/T209';
export const tests = ['guard/F43'];
export const title = 'Guard finds the nearest kaal-guard.json of each changed file, at a package root or in an open Change folder wherever it lives, runs only those checks narrowed by their when, runs the .kaal root file on every run, and stops running a Change\'s checks once its file is gone';
const ALL = ['alpha', 'alpha-lib', 'beta', 'c7', 'c8', 'c9', 'always', 'declared'];
export function run() {
  const dir = scratch({
    ...baseline, ...scripts('alpha', 'alpha-lib', 'beta', 'c7', 'c8', 'c9', 'always'),
    '.kaal/kaal-guard.json': kg('always'),
    'packages/kaal-alpha/kaal-guard.json': kg('alpha', { id: 'alpha-lib', when: ['lib/**'] }),
    'packages/kaal-beta/kaal-guard.json': kg('beta'),
    'somewhere/else/entirely/00-changes/C7-x/kaal-guard.json': kg('c7'),
    'engineering/area/00-changes/C8-x/kaal-guard.json': kg('c8'),
    'packages/kaal-alpha/00-changes/C9-x/kaal-guard.json': kg('c9'),
  });
  try {
    const base = rev(dir, 'HEAD');
    // A change outside lib/: the package's unnarrowed check, the .kaal file, never another package's or a Change's.
    commit(dir, { 'packages/kaal-alpha/README.md': 'x\n' });
    let r = hook(dir, base);
    assert.deepEqual(ran(r, ALL), ['alpha', 'always'], `wrong selection for a package file outside lib/: ${r.out}`);
    commit(dir, { 'packages/kaal-alpha/lib/a.mjs': 'x\n' });
    r = hook(dir, base);
    assert.deepEqual(ran(r, ALL), ['alpha', 'alpha-lib', 'always'], `when did not widen to lib/: ${r.out}`);
    // A file in an open Change folder finds the Change's file, wherever the folder is, and the host package's file is not nearest.
    commit(dir, { 'somewhere/else/entirely/00-changes/C7-x/note.md': 'x\n', 'engineering/area/00-changes/C8-x/note.md': 'x\n', 'packages/kaal-alpha/00-changes/C9-x/note.md': 'x\n' });
    r = hook(dir, base);
    assert.deepEqual(ran(r, ['c7', 'c8', 'c9', 'beta']), ['c7', 'c8', 'c9'], `a Change's own file was not the nearest: ${r.out}`);
    // A file with no nearest kaal-guard.json selects nothing; the .kaal root file still runs.
    const base2 = rev(dir, 'HEAD');
    commit(dir, { '.github/workflows/x.yml': 'x\n' });
    r = hook(dir, base2);
    assert.deepEqual(ran(r, ALL), ['always', 'declared'], `a file with no kaal-guard.json selected a check, or the .kaal file did not run: ${r.out}`);
    assert.equal(r.status, 0, r.out);
    // A closed Change: its file is removed and its checks are gone.
    const base3 = rev(dir, 'HEAD');
    commit(dir, { 'somewhere/else/entirely/00-changes/C7-x/kaal-guard.json': null, 'somewhere/else/entirely/00-changes/C7-x/note.md': 'y\n' });
    r = hook(dir, base3);
    assert.deepEqual(ran(r, ['c7']), [], `a closed Change's checks still ran: ${r.out}`);
  } finally { cleanup(dir); }
}
