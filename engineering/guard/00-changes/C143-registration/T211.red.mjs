// Case guard/T211 tests: F45
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, owner, plan, rev, reg, scratch } from './lib.mjs';
export const id = 'guard/T211';
export const tests = ['guard/F45'];
export const title = 'Guard runs the execution plan it is given and no other: the registrations the plan names, every hard-wired check always, every registration when the plan is unknown or absent or --full is given, and a plan naming no registration is cannot judge';
export function run() {
  const dir = scratch({ ...baseline, ...owner('alpha'), ...reg('alpha', 'alpha'), ...reg('beta', 'beta'), ...reg('gamma', 'gamma') });
  try {
    const base = rev(dir, 'HEAD');
    commit(dir, { 'packages/alpha/a.txt': '1\n' });
    const ran = (r) => ['alpha', 'beta', 'gamma', 'delivery'].filter((n) => r.out.includes(`RAN ${n}`));
    let r = hook(dir, base, ['--plan', plan(dir, { checks: ['alpha', 'beta'] })]);
    assert.deepEqual(ran(r), ['alpha', 'beta', 'delivery'], `the plan was not followed, or a hard-wired check was selected away: ${r.out}`);
    r = hook(dir, base, ['--plan', plan(dir, { unknown: true })]);
    assert.deepEqual(ran(r), ['alpha', 'beta', 'gamma', 'delivery'], `an unknown plan did not run everything: ${r.out}`);
    r = hook(dir, base);
    assert.deepEqual(ran(r), ['alpha', 'beta', 'gamma', 'delivery'], `no plan did not run everything: ${r.out}`);
    r = hook(dir, base, ['--full', '--plan', plan(dir, { checks: ['alpha'] })]);
    assert.deepEqual(ran(r), ['alpha', 'beta', 'gamma', 'delivery'], `--full was narrowed by a plan: ${r.out}`);
    r = hook(dir, base, ['--plan', plan(dir, { checks: ['nothing-registered'] })]);
    assert.equal(r.status, 2, `a plan naming no registration was not cannot judge: ${r.status} ${r.out}`);
  } finally { cleanup(dir); }
}
