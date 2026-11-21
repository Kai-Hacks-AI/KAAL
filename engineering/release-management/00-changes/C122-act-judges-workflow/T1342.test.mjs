// Case release/T1342 tests: release/F90
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { REPO, RM, RUNNER, ROOT, RETROS, ACT_PATHS, makeTrees, gitMerge, retroText } from './act-fixtures.mjs';
const lib = () => import(pathToFileURL(join(RM, '05-src/phase/lib/tree-facts.mjs')).href);
const runner = () => import(pathToFileURL(RUNNER).href);
const answerOf = async (name, spec, changed = ACT_PATHS) => {
  const t = makeTrees(spec);
  try { const { readTree } = await lib(); const { judgeOf } = await runner(); return judgeOf(name, await readTree({ main: t.main, collector: t.pr, changed }), t.pr); } finally { t.cleanup(); }
};
export const id = 'release/T1342';
export const tests = ['release/F90'];
export const title = 'the flag decides the exit code only: exactly on makes a FAIL or an UNKNOWN exit 1, anything else exits 0 with the verdict written';
export async function run() {
  const { exitCodeOf, reportOf } = await runner();
  const answers = [{ verdict: 'FAIL', applies: true, message: 'f' }, { verdict: 'UNKNOWN', applies: true, message: 'u' }];
  for (const a of answers) {
    for (const flag of [undefined, '', 'off', 'ON', 'true', 'on ', '1']) assert.equal(exitCodeOf(a, flag), 0, `${a.verdict} flag ${JSON.stringify(flag)}`);
    assert.equal(exitCodeOf(a, 'on'), 1, a.verdict);
    assert.match(reportOf('demand', a, undefined), new RegExp(`^${a.verdict}: demand Act: .*reported only`));
    assert.match(reportOf('demand', a, 'on'), /advisory, not required/);
  }
  const ok = { verdict: 'PASS', applies: true, message: 'p' };
  assert.equal(exitCodeOf(ok, 'on'), 0); assert.equal(reportOf('limit', ok, 'on'), 'PASS: limit Act: p');
  // end to end, over a real merge commit: the base moved, and only the pull request's own paths are changed
  const t = makeTrees(); const g = gitMerge(t);
  try {
    const { changedPaths } = await runner();
    assert.deepEqual(changedPaths(g.repo).sort(), [...ACT_PATHS, `${ROOT}/00-changes/C2-first-thing/C2.md`, `${ROOT}/00-changes/C2-first-thing/change.md`, `${ROOT}/00-changes/C2-first-thing/do.md`].sort());
    assert.ok(!changedPaths(g.repo).includes('unrelated.txt'), 'a change of the base is not the pull request\'s');
    const run = (flag) => spawnSync('node', [RUNNER, 'limit', '--main', t.main, '--pr', g.repo], { encoding: 'utf8', env: { ...process.env, KAAL_FLAG: flag } });
    const off = run(''), on = run('on');
    assert.match(off.stdout, /^FAIL: limit Act: /); assert.equal(off.status, 0);
    assert.equal(on.status, 1);
  } finally { g.cleanup(); t.cleanup(); }
}
