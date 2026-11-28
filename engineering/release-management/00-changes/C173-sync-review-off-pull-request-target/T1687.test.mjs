// Case release/T1687 tests: release/C173
import assert from 'node:assert/strict';
import { source, jobOf, world } from './fixture.mjs';
export const id = 'release/T1687';
export const tests = ['release/C173'];
export const title = 'sign Sync posts exactly one check run named verify Sync at the head of the bound run through postCheckRun under an Inspector grant, with the conclusion of the verdict, and posts nothing for an unknown or refused verdict';
const ENV = { KAAL_APP_INSPECTOR_ID: '5953432', KAAL_APP_INSPECTOR_KEY: 'k' };
export async function run() {
  const act = source('sync-act.yml');
  const job = jobOf(act, 'sign Sync');
  assert.ok(job.includes('ref: ${{ github.event.repository.default_branch }}') && job.includes('npm run build') && job.includes('KAAL_APP_INSPECTOR_KEY: ${{ secrets.KAAL_APP_INSPECTOR_KEY }}'), 'sign builds Hosting from the default branch and holds the Inspector key');
  assert.ok(!/postCheckRun|curl|check-runs/.test(act), 'the workflow builds a POST by hand');
  const x = await world();
  try {
    const calls = [];
    const hosting = {
      mintToken: async (r) => { calls.push(['mint', r]); return { grant: 1 }; },
      postCheckRun: async (repo, c, o) => { calls.push(['post', repo, c, o]); return { signer: 'kaal-inspector', ...c }; },
    };
    const go = async (env = {}, over = {}) => { calls.length = 0; return x.run((e, d) => x.sign(e, d), x.actEnv({ ...ENV, ...env }), { hosting, ...over }); };
    assert.equal(await go(), 0);
    assert.equal(calls.filter((c) => c[0] === 'post').length, 1, 'exactly one post');
    const [, repo, check, opts] = calls.find((c) => c[0] === 'post');
    assert.equal(repo, 'o/r');
    assert.equal(check.name, 'verify Sync');
    assert.equal(check.revision, x.w.head);
    assert.equal(check.conclusion, 'success');
    assert.deepEqual(opts, { grant: { grant: 1 } });
    assert.deepEqual(calls.find((c) => c[0] === 'mint')[1].abilities, ['post-checks']);
    assert.equal(calls.find((c) => c[0] === 'mint')[1].app, 'inspector');
    assert.equal(x.w.outs.signed, 'success');
    // a failing verdict is signed as failure
    const fail = JSON.parse(x.sent); fail.verdict = { ...fail.verdict, outcome: 'FAIL', passes: false, reasons: [{ code: 'no-reason', detail: 'x' }] };
    x.setFile(JSON.stringify(fail));
    await go();
    assert.equal(calls.find((c) => c[0] === 'post')[2].conclusion, 'failure');
    // an unknown verdict and every refusal of T1686 post nothing
    for (const [name, file, env] of [['unknown', JSON.stringify({ ...fail, verdict: { ...fail.verdict, outcome: 'UNKNOWN', passes: false } }), {}], ['no artifact', null, {}], ['another run', JSON.stringify({ ...JSON.parse(x.sent), runId: '1' }), {}], ['another workflow file', x.sent, { KAAL_RUN_PATH: '.github/workflows/evil.yml' }]]) {
      x.setFile(file);
      assert.equal(await go(env), 0, name);
      assert.equal(calls.filter((c) => c[0] === 'post').length, 0, `${name}: something was posted`);
      assert.equal(x.w.outs.signed, 'none');
    }
    // a refused or failed post is a red job and nothing is signed
    x.setFile(x.sent);
    assert.equal(await go({}, { hosting: { ...hosting, postCheckRun: async () => { throw new Error('CHECK_FAILED'); } } }), 1);
    assert.equal(x.w.outs.signed, 'none');
    assert.equal(await go({ KAAL_APP_INSPECTOR_KEY: '' }), 1, 'no credential is red');
  } finally { x.w.done(); }
}
