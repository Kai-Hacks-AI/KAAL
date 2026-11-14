// Case guard/T211 tests: F45
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, rev, reg, scratch } from './lib.mjs';
export const id = 'guard/T211';
export const tests = ['guard/F45'];
export const title = 'only the capabilities in flight and their dependents run, a capability untouched and independent does not, and --full runs every registration at the gate';
export function run() {
  const dir = scratch({
    ...baseline,
    ...reg('alpha', 'alpha'),
    ...reg('beta', 'beta', 'depends: [alpha]\n'),
    ...reg('gamma', 'gamma'),
    'packages/alpha/a.txt': '1\n', 'packages/gamma/g.txt': '1\n',
  });
  try {
    const base = rev(dir, 'HEAD');
    commit(dir, { 'packages/alpha/a.txt': '2\n' });
    let r = hook(dir, base);
    assert.ok(r.out.includes('RAN alpha'), `the touched capability did not run: ${r.out}`);
    assert.ok(r.out.includes('RAN beta'), `a dependent of the touched capability did not run: ${r.out}`);
    assert.ok(!r.out.includes('RAN gamma'), `an untouched independent capability ran: ${r.out}`);
    assert.ok(r.out.includes('RAN delivery'), 'a hard-wired delivery check was subject to selection');
    r = hook(dir, base, ['--full']);
    for (const n of ['alpha', 'beta', 'gamma', 'delivery']) assert.ok(r.out.includes(`RAN ${n}`), `--full did not run ${n}: ${r.out}`);
  } finally { cleanup(dir); }
}
