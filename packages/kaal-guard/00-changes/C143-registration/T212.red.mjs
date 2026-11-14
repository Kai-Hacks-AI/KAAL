// Case guard/T212 tests: F46
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, rev, scratch } from './lib.mjs';
import { decl, say } from './lib.mjs';
export const id = 'guard/T212';
export const tests = ['guard/F46'];
export const title = 'a registration cannot replace, shadow or switch off a hard-wired check: a registration named like one is cannot judge, and the hard-wired check still runs';
export function run() {
  const dir = scratch(baseline);
  try {
    const base = rev(dir, 'HEAD');
    commit(dir, { '.kaal/guard/registered/demo/delivery.md': decl('shadow.mjs', 'capability: demo\n'), 'shadow.mjs': say('shadow') });
    const r = hook(dir, base);
    assert.equal(r.status, 2, `a shadowing registration was not cannot judge: ${r.status} ${r.out}`);
    assert.ok(!r.out.includes('RAN shadow'), 'the shadowing registration ran');
    assert.match(r.out, /delivery/, 'the refusal does not name the hard-wired check');
  } finally { cleanup(dir); }
}
