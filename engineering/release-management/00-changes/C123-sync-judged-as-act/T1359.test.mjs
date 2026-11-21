// Case release/T1359 tests: release/C123
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { RUNNER, OWN_PATH, makeFolders } from './isolation-fixtures.mjs';
export const id = 'release/T1359';
export const tests = ['release/C123'];
export const title = 'isolate Changes reports on its own, without a judge: it names the own paths or the folder it lacks, and its flag decides the exit code only';
export async function run() {
  const f = makeFolders([{ path: OWN_PATH, before: null, after: 'own\n', contained: null }, { path: '.github/workflows/x.yml', before: 'old\n', after: 'from main\n' }]);
  try {
    const run = (flag, extra) => spawnSync('node', [RUNNER, 'isolate', '--main', f.main, '--pr', f.after, ...extra], { encoding: 'utf8', env: { ...process.env, KAAL_FLAG: flag } });
    const all = ['--before', f.before, '--contained', f.contained];
    for (const flag of ['', 'on']) { const r = run(flag, all); assert.equal(r.stdout.trim(), `PASS: isolate Changes: 1 own, 1 inherited; own: ${OWN_PATH}`); assert.equal(r.status, 0); }
    const off = run('', ['--before', f.before]), on = run('on', ['--before', f.before]);
    assert.match(off.stdout, /^UNKNOWN: isolate Changes: no attribution without contained \(reported only: the flag is not on/); assert.equal(off.status, 0);
    assert.match(on.stdout, /^UNKNOWN: isolate Changes: no attribution without contained \(advisory, not required/); assert.equal(on.status, 1);
  } finally { f.cleanup(); }
}
