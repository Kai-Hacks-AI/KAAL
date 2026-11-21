// Case release/T1342 tests: release/F90
import assert from 'node:assert/strict';
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
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
  // end to end, over the folders of attribute Changes (release/C123): the own paths of the pull request are judged, what the base brought is not
  const t = makeTrees(); const before = `${t.pr}-before`;
  try {
    cpSync(t.main, before, { recursive: true });
    const run = (flag) => spawnSync('node', [RUNNER, 'limit', '--main', t.main, '--pr', t.pr, '--before', before, '--contained', before], { encoding: 'utf8', env: { ...process.env, KAAL_FLAG: flag } });
    const off = run(''), on = run('on');
    assert.match(off.stdout, /^FAIL: limit Act: /); assert.equal(off.status, 0);
    assert.equal(on.status, 1);
  } finally { rmSync(before, { recursive: true, force: true }); t.cleanup(); }
}
