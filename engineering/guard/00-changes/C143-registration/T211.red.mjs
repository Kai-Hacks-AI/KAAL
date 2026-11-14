// Case guard/T211 tests: F45
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { baseline, cleanup, commit, hook, owner, plan, rev, reg, scratch } from './lib.mjs';
export const id = 'guard/T211';
export const tests = ['guard/F45'];
export const title = 'Guard runs the execution plan it is given and no other, for registrations only and leaving the repository\'s declared checks as they are: the registrations the plan names, every registration when the plan is unknown or absent or --full is given, and an invalid, unreadable, empty or unmatched plan is cannot judge, never a silent success';
export function run() {
  const dir = scratch({ ...baseline, ...owner('alpha'), ...reg('alpha', 'alpha'), ...reg('beta', 'beta'), ...reg('gamma', 'gamma') });
  try {
    const base = rev(dir, 'HEAD');
    commit(dir, { 'packages/alpha/a.txt': '1\n' });
    const ran = (r) => ['alpha', 'beta', 'gamma', 'declared'].filter((n) => r.out.includes(`RAN ${n}`));
    let r = hook(dir, base, ['--plan', plan(dir, { checks: ['alpha', 'beta'] })]);
    assert.deepEqual(ran(r), ['alpha', 'beta', 'declared'], `the plan was not followed, or a declared check was changed by it: ${r.out}`);
    r = hook(dir, base, ['--plan', plan(dir, { unknown: true })]);
    assert.deepEqual(ran(r), ['alpha', 'beta', 'gamma', 'declared'], `an unknown plan did not run everything: ${r.out}`);
    r = hook(dir, base);
    assert.deepEqual(ran(r), ['alpha', 'beta', 'gamma', 'declared'], `no plan did not run everything: ${r.out}`);
    assert.match(r.out, /no plan/i, 'a run with no plan does not say so');
    r = hook(dir, base, ['--full', '--plan', plan(dir, { checks: ['alpha'] })]);
    assert.deepEqual(ran(r), ['alpha', 'beta', 'gamma', 'declared'], `--full was narrowed by a plan: ${r.out}`);
    for (const bad of [{ checks: [] }, { checks: 'alpha' }, {}, []]) {
      r = hook(dir, base, ['--plan', plan(dir, bad)]);
      assert.equal(r.status, 2, `an invalid plan ${JSON.stringify(bad)} was not cannot judge: ${r.status} ${r.out}`);
    }
    r = hook(dir, base, ['--plan', join(dir, '.git', 'no-such-plan.json')]);
    assert.equal(r.status, 2, `an unreadable plan was not cannot judge: ${r.status} ${r.out}`);
    r = hook(dir, base, ['--plan', plan(dir, { checks: ['nothing-registered'] })]);
    assert.equal(r.status, 2, `a plan naming no registration was not cannot judge: ${r.status} ${r.out}`);
  } finally { cleanup(dir); }
}
