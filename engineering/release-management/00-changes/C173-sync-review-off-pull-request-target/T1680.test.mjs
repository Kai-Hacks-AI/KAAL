// Case release/T1680 tests: release/C173
import assert from 'node:assert/strict';
import { source, jobOf } from './fixture.mjs';
export const id = 'release/T1680';
export const tests = ['release/C173'];
export const title = 'the verify workflow triggers on pull_request alone, holds no permission, token or secret, and no workflow of the sync review names pull_request_target';
export async function run() {
  const verify = source('sync-verify-plain.yml'), act = source('sync-act.yml');
  assert.match(verify, /^on:\n {2}pull_request:\n/m);
  assert.ok(!/^ {2}(push|pull_request_target|schedule|workflow_dispatch|merge_group|workflow_run):/m.test(verify), 'another trigger');
  assert.match(verify, /^permissions: \{\}$/m);
  const job = jobOf(verify, 'verify Sync');
  assert.match(job, /^    permissions: \{\}$/m, 'verify Sync holds permissions');
  assert.ok(!/GH_TOKEN|github\.token|secrets\.|vars\.|: write/.test(verify), 'verify holds a token, a secret or a write');
  assert.ok(!/gh api|gh pr/.test(verify), 'verify calls an API');
  assert.ok(!/pull_request_target/.test(verify + act), 'a sync workflow names pull_request_target');
}
