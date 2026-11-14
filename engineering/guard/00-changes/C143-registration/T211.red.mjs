// Case guard/T211 tests: F45
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, dependsOn, hook, owner, rev, reg, scratch } from './lib.mjs';
export const id = 'guard/T211';
export const tests = ['guard/F45'];
export const title = 'selection follows the base\'s trusted ownership and dependencies, ignores a registration\'s own claim, expands to every check when a change or a dependency is unknown, and --full runs every registration';
export function run() {
  const files = {
    ...baseline,
    ...owner('alpha'), ...owner('beta'), ...owner('gamma'), ...dependsOn('beta', 'alpha'),
    ...reg('alpha', 'alpha'), ...reg('beta', 'beta'), ...reg('gamma', 'gamma'),
    'packages/alpha/a.txt': '1\n', 'packages/gamma/g.txt': '1\n',
  };
  const dir = scratch(files);
  try {
    const base = rev(dir, 'HEAD');
    commit(dir, { 'packages/alpha/a.txt': '2\n' });
    let r = hook(dir, base);
    assert.ok(r.out.includes('RAN alpha'), `the touched capability did not run: ${r.out}`);
    assert.ok(r.out.includes('RAN beta'), `a dependent, by the base's dependencies, did not run: ${r.out}`);
    assert.ok(!r.out.includes('RAN gamma'), `an untouched independent capability ran: ${r.out}`);
    assert.ok(r.out.includes('RAN delivery'), 'a hard-wired delivery check was subject to selection');
    // A dependency a candidate declares for itself is not trusted: gamma claims to depend on alpha, the base says it does not.
    commit(dir, { 'packages/gamma/guard/gamma.md': files['packages/gamma/guard/gamma.md'].replace('capability: gamma', 'capability: gamma\ndepends: [alpha]'), 'packages/gamma/g.txt': '2\n' });
    r = hook(dir, base);
    assert.ok(r.status === 2 || !r.out.includes('RAN alpha'), 'a self-declared depends pulled another capability in or was accepted');
    // An unknown change (a path no ownership claims) expands to every check, never omits one.
    const dir2 = scratch(files);
    try {
      const b2 = rev(dir2, 'HEAD');
      commit(dir2, { 'tools/unowned.txt': 'x\n' });
      r = hook(dir2, b2);
      for (const n of ['alpha', 'beta', 'gamma', 'delivery']) assert.ok(r.out.includes(`RAN ${n}`), `an unattributed change did not expand to ${n}: ${r.out}`);
      // --full is unconditional.
      commit(dir2, { 'packages/gamma/g.txt': '3\n' });
      r = hook(dir2, b2, ['--full']);
      for (const n of ['alpha', 'beta', 'gamma', 'delivery']) assert.ok(r.out.includes(`RAN ${n}`), `--full did not run ${n}: ${r.out}`);
    } finally { cleanup(dir2); }
  } finally { cleanup(dir); }
}
