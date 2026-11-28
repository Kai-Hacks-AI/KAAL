// Case release/T1683 tests: release/C173
import assert from 'node:assert/strict';
import { source, jobOf, world } from './fixture.mjs';
export const id = 'release/T1683';
export const tests = ['release/C173'];
export const title = 'approve Sync and review Sync write with the Approver App token and not with GITHUB_TOKEN, and without the App credential approve is a dry run and review says that it cannot write';
export async function run() {
  const act = source('sync-act.yml');
  assert.match(act, /^permissions: \{\}$/m);
  assert.ok(!/^ {6}[a-z-]+: write$/m.test(act), 'GITHUB_TOKEN carries a write in a workflow_run job');
  for (const name of ['approve Sync', 'review Sync']) {
    const j = jobOf(act, name);
    assert.ok(j.includes('uses: actions/create-github-app-token@') && j.includes('vars.KAAL_APP_APPROVER_ID') && j.includes('secrets.KAAL_APP_APPROVER_KEY'), `${name} does not mint the Approver App token`);
    assert.ok(j.includes('permission-pull-requests: write'), `${name}: the App token is not asked for pull request writes`);
  }
  assert.ok(jobOf(act, 'approve Sync').includes("KAAL_SYNC_APPROVE: ${{ steps.app.outputs.token != '' && vars.KAAL_SYNC_APPROVE || '' }}"), 'approve is not a dry run without the credential');
  assert.ok(jobOf(act, 'review Sync').includes('steps.app.outputs.token == \'\'') && /cannot label/.test(jobOf(act, 'review Sync')), 'review does not say that it cannot write');
  // without the switch, approve says what it would do and posts nothing
  const x = await world();
  try {
    x.run(x.approve, x.actEnv({ KAAL_SYNC_APPROVE: '' }));
    assert.equal(x.w.outs.approval, 'would-approve');
    assert.equal(x.w.posted(/pulls\/7\/reviews/).length, 0);
  } finally { x.w.done(); }
}
