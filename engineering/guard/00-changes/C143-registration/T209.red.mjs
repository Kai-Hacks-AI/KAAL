// Case guard/T209 tests: F43
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, owner, rev, reg, scratch } from './lib.mjs';
export const id = 'guard/T209';
export const tests = ['guard/F43'];
export const title = 'a check its capability sources and installs is run by the unchanged hook invocation beside the hard-wired check; an installed copy that differs from its source, or has none, is cannot judge';
export function run() {
  const dir = scratch({ ...baseline, ...owner('alpha') });
  try {
    const base = rev(dir, 'HEAD');
    commit(dir, reg('alpha', 'registered'));
    let r = hook(dir, base);
    assert.ok(r.out.includes('RAN delivery'), `the hard-wired check did not run: ${r.out}`);
    assert.ok(r.out.includes('RAN registered'), `the registered check was not run: ${r.out}`);
    assert.equal(r.status, 0, r.out);
    // Provenance: the installed copy is the source, byte for byte. A second, independently editable source is refused.
    commit(dir, reg('alpha', 'registered', { installed: '---\ntype: Guard/Check\ncommand: node -e 0\nruns: [hook]\ncapability: alpha\n---\nedited by hand\n' }));
    r = hook(dir, base);
    assert.equal(r.status, 2, `an installed copy that differs from its source was not cannot judge: ${r.status} ${r.out}`);
    assert.ok(!r.out.includes('RAN registered'), 'the edited copy ran');
    commit(dir, { 'packages/alpha/guard/registered.md': null });
    r = hook(dir, base);
    assert.equal(r.status, 2, `an installed registration with no source was not cannot judge: ${r.status} ${r.out}`);
  } finally { cleanup(dir); }
}
