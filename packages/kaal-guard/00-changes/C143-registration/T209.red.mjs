// Case guard/T209 tests: F43
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, rev, reg, scratch } from './lib.mjs';
export const id = 'guard/T209';
export const tests = ['guard/F43'];
export const title = 'a check a capability registers is run by the unchanged hook invocation, beside the check the repository hard-wires, with no edit of the hook or the workflow';
export function run() {
  const dir = scratch(baseline);
  try {
    const base = rev(dir, 'HEAD');
    commit(dir, reg('demo', 'registered'));
    const r = hook(dir, base);
    assert.ok(r.out.includes('RAN delivery'), `the hard-wired check did not run: ${r.out}`);
    assert.ok(r.out.includes('RAN registered'), `the registered check was not run: ${r.out}`);
    assert.equal(r.status, 0, r.out);
  } finally { cleanup(dir); }
}
