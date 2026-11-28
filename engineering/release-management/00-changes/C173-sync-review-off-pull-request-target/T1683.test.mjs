// Case release/T1683 tests: release/C173
import assert from 'node:assert/strict';
import { source, jobOf, world, load } from './fixture.mjs';
export const id = 'release/T1683';
export const tests = ['release/C173'];
export const title = 'approve Sync and review Sync write with the Approver App token and not with GITHUB_TOKEN, and without the App credential approve is a dry run and review says that it cannot write';
export async function run() {
  const act = source('sync-act.yml');
  assert.match(act, /^permissions: \{\}$/m);
  assert.ok(!/^ {6}[a-z-]+: write$/m.test(act), 'GITHUB_TOKEN carries a write in a workflow_run job');
  const review = jobOf(act, 'review Sync'), approve = jobOf(act, 'approve Sync');
  assert.ok(review.includes('uses: actions/create-github-app-token@') && review.includes('vars.KAAL_APP_APPROVER_ID') && review.includes('secrets.KAAL_APP_APPROVER_KEY') && review.includes('permission-pull-requests: write'), 'review Sync does not mint the Approver App token');
  assert.ok(approve.includes('vars.KAAL_APP_APPROVER_ID') && approve.includes('secrets.KAAL_APP_APPROVER_KEY') && !/github\.token/.test(approve), 'approve Sync does not hold the Approver credential alone');
  assert.ok(approve.includes('judge-approval.mjs') && approve.includes('approve-judged'), 'approve Sync does not carry out the judgment of Review C8');
  assert.ok(jobOf(act, 'review Sync').includes('steps.app.outputs.token == \'\'') && /cannot label/.test(jobOf(act, 'review Sync')), 'review does not say that it cannot write');
  // without the credential, or the judgment, or the switch, approve says what it would ask and posts nothing
  const x = await world();
  try {
    const { approveJudged } = await load('cli.mjs');
    const run = (env, over = {}) => { x.w.reset(); return approveJudged(x.actEnv(env), x.deps({ git: () => ({ status: 0, stdout: 'a'.repeat(40), stderr: '' }), ...over })); };
    assert.equal(await run({}), 0);
    assert.equal(x.w.outs.approval, 'would-approve');
    const posts = [];
    const hosting = { mintToken: async () => ({ g: 1 }), readPullRequestFacts: async () => ({ head: { sha: 'h'.repeat(40) }, base: { sha: 'b'.repeat(40) } }), postReview: async (r) => { posts.push(r); } };
    const cred = { KAAL_APP_APPROVER_ID: '1', KAAL_APP_APPROVER_KEY: 'k', KAAL_EVENT_NAME: 'workflow_run' };
    assert.equal(await run({ ...cred, KAAL_SYNC_APPROVE: 'on' }, { hosting }), 0);
    assert.equal(x.w.outs.approval, 'would-approve', 'no judgment installed: still a dry run');
    assert.equal(posts.length, 0);
    for (const [mode, decision, expected] of [['', 'approve', 'would-approve'], ['on', 'abstain', 'skipped'], ['on', 'approve', 'approved']]) {
      posts.length = 0;
      assert.equal(await run({ ...cred, KAAL_SYNC_APPROVE: mode }, { hosting, judge: () => ({ decision, findings: [] }) }), 0);
      assert.equal(x.w.outs.approval, expected, `${mode}/${decision}`);
      assert.equal(posts.length, expected === 'approved' ? 1 : 0);
    }
    assert.deepEqual(posts[0], { revision: 'h'.repeat(40), event: 'APPROVE' }, 'the review is pinned to the head Review C8 judged');
  } finally { x.w.done(); }
}
