// Case release/T1357 tests: release/C123
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { RUNNER, OWN_PATH, makeFolders } from './isolation-fixtures.mjs';
export const id = 'release/T1357';
export const tests = ['release/C123'];
export const title = 'the runner asks isolate Changes once for all four judges: with the folders it judges the own paths, without them it says UNKNOWN, and the flag still decides the exit code only';
export async function run() {
  const f = makeFolders([{ path: OWN_PATH, before: null, after: 'own\n', contained: null }, { path: '.github/workflows/x.yml', before: 'old\n', after: 'from main\n' }]);
  try {
    const run = (flag, extra) => spawnSync('node', [RUNNER, 'limit', '--main', f.main, '--pr', f.after, ...extra], { encoding: 'utf8', env: { ...process.env, KAAL_FLAG: flag } });
    const withAll = ['--before', f.before, '--contained', f.contained];
    const a = run('', withAll), b = run('on', withAll);
    assert.match(a.stdout, /^PASS: limit Act: not an ACT/); assert.equal(a.status, 0);   // the own path lies outside the folders an ACT writes: no ACT
    assert.equal(b.status, 0);
    const none = run('', []), live = run('on', []);
    assert.match(none.stdout, /^UNKNOWN: limit Act: cannot tell what the pull request changed itself: no attribution without before, contained/); assert.equal(none.status, 0);
    assert.equal(live.status, 1);
  } finally { f.cleanup(); }
}
