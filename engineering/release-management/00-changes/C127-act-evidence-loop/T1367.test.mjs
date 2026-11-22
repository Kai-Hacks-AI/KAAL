// Case release/T1367 tests: release/C127
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { RUNNER, OWN_PATH, makeFolders } from '../C123-sync-judged-as-act/isolation-fixtures.mjs';
export const id = 'release/T1367';
export const tests = ['release/C127'];
export const title = 'the runner prints one record per judge per run with the judge, check, pull request, merge result, run, verdict, applies and attribution, and a run without attribution says missing';
const RECORD = /^act-evidence (\{.*\})$/m;
export async function run() {
  const f = makeFolders([{ path: OWN_PATH, before: null, after: 'own\n', contained: null }]);
  try {
    const env = { ...process.env, KAAL_FLAG: '', KAAL_PR: '2310', KAAL_MERGE_SHA: 'abc123', KAAL_RUN_ID: '999' };
    const ask = (judge, extra) => spawnSync('node', [RUNNER, judge, '--main', f.main, '--pr', f.after, ...extra], { encoding: 'utf8', env });
    const all = ['--before', f.before, '--contained', f.contained];
    for (const judge of ['hold', 'demand', 'verify', 'limit']) {
      const r = JSON.parse(ask(judge, all).stdout.match(RECORD)[1]);
      assert.deepEqual(Object.keys(r).sort(), ['applies', 'attribution', 'check', 'judge', 'kind', 'merge', 'pr', 'run', 'verdict']);
      assert.equal(r.kind, 'run'); assert.equal(r.judge, judge); assert.equal(r.check, `${judge} Act`);
      assert.equal(r.pr, 2310); assert.equal(r.merge, 'abc123'); assert.equal(r.run, '999'); assert.equal(r.attribution, 'complete');
    }
    const limit = JSON.parse(ask('limit', all).stdout.match(RECORD)[1]);
    assert.equal(limit.verdict, 'PASS'); assert.equal(limit.applies, false);   // the own path lies outside the folders an ACT writes: not an ACT
    const missing = JSON.parse(ask('limit', []).stdout.match(RECORD)[1]);
    assert.equal(missing.attribution, 'missing'); assert.equal(missing.verdict, 'UNKNOWN');
    assert.doesNotMatch(ask('isolate', all).stdout, /act-evidence/, 'isolate Changes is not a judge and leaves no judge record');
    const bare = spawnSync('node', [RUNNER, 'limit', '--main', f.main, '--pr', f.after, ...all], { encoding: 'utf8', env: { ...process.env, KAAL_FLAG: '', KAAL_PR: '', KAAL_MERGE_SHA: '', KAAL_RUN_ID: '' } });
    const none = JSON.parse(bare.stdout.match(RECORD)[1]);
    assert.equal(none.pr, null); assert.equal(none.merge, null); assert.equal(none.run, null);   // a record that names no pull request exists and counts toward nothing
  } finally { f.cleanup(); }
}
