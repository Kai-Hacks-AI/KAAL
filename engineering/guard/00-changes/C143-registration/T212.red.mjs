// Case guard/T212 tests: F46
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, owner, regText, rev, say, scratch } from './lib.mjs';
export const id = 'guard/T212';
export const tests = ['guard/F46'];
export const title = 'a registration cannot replace, shadow or switch off a hard-wired check: one named like it is cannot judge, and the hard-wired check still runs';
export function run() {
  const dir = scratch({ ...baseline, ...owner('alpha') });
  try {
    const base = rev(dir, 'HEAD');
    const text = regText('solution', 'alpha', 'delivery', 'packages/alpha/guard/delivery.md').replace('delivery.mjs', 'shadow.mjs');
    commit(dir, { 'packages/alpha/guard/delivery.md': text, '.kaal/guard/registered/solution/alpha/delivery.md': text, 'shadow.mjs': say('shadow') });
    const r = hook(dir, base);
    assert.equal(r.status, 2, `a shadowing registration was not cannot judge: ${r.status} ${r.out}`);
    assert.ok(!r.out.includes('RAN shadow'), 'the shadowing registration ran');
    assert.match(r.out, /delivery/, 'the refusal does not name the hard-wired check');
  } finally { cleanup(dir); }
}
