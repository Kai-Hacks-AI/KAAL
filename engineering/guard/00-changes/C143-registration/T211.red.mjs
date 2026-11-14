// Case guard/T211 tests: F45
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { baseline, cleanup, commit, hook, kg, plan, ran, rev, scratch, scripts } from './lib.mjs';
export const id = 'guard/T211';
export const tests = ['guard/F45'];
export const title = 'when the selection is unknown, or --full is given, Guard runs every kaal-guard.json; the Engine\'s plan adds capabilities in flight; an invalid, unreadable or empty plan is cannot judge; no outcome is a silent success';
const ALL = ['alpha', 'beta', 'gamma', 'declared'];
export function run() {
  const dir = scratch({ ...baseline, ...scripts('alpha', 'beta', 'gamma'), 'packages/kaal-alpha/kaal-guard.json': kg('alpha'), 'packages/kaal-beta/kaal-guard.json': kg('beta'), 'packages/kaal-gamma/kaal-guard.json': kg('gamma') });
  try {
    const base = rev(dir, 'HEAD');
    commit(dir, { 'packages/kaal-alpha/a.txt': '1\n' });
    let r = hook(dir, base, [], { noChanged: true });
    assert.deepEqual(ran(r, ['alpha', 'beta', 'gamma']), ['alpha', 'beta', 'gamma'], `an uncomputable selection did not run everything: ${r.out}`);
    assert.match(r.out, /unknown/i, 'a run on an unknown selection does not say so');
    r = hook(dir, base, ['--full']);
    assert.deepEqual(ran(r, ALL), ALL, `--full did not run everything: ${r.out}`);
    r = hook(dir, base, ['--plan', plan(dir, { 'in-flight': ['packages/kaal-beta'] })]);
    assert.deepEqual(ran(r, ALL), ['alpha', 'beta', 'declared'], `the plan's capability in flight was not added: ${r.out}`);
    r = hook(dir, base, ['--plan', plan(dir, { unknown: true })]);
    assert.deepEqual(ran(r, ALL), ALL, `an unknown plan did not run everything: ${r.out}`);
    for (const bad of [{ 'in-flight': 'beta' }, {}, [], { 'in-flight': [] }]) {
      r = hook(dir, base, ['--plan', plan(dir, bad)]);
      assert.equal(r.status, 2, `an invalid plan ${JSON.stringify(bad)} was not cannot judge: ${r.status} ${r.out}`);
    }
    r = hook(dir, base, ['--plan', join(dir, '.git', 'no-such-plan.json')]);
    assert.equal(r.status, 2, `an unreadable plan was not cannot judge: ${r.status} ${r.out}`);
  } finally { cleanup(dir); }
}
