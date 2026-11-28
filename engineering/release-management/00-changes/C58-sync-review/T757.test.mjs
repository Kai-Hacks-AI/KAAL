// Case release/T757 tests: release/C58
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
// release/C173: the three jobs live in two sources, verify Sync on pull_request and approve Sync and review Sync on workflow_run.
const VERIFY = join(RM, '05-src/wiring/workflows/sync-verify-plain.yml');
const ACT = join(RM, '05-src/wiring/workflows/sync-act.yml');
export const id = 'release/T757';
export const tests = ['release/C58'];
export const title = 'the workflow source runs the three controls only for a SYNC into an integration branch, judges from the default branch, writes only to the pull request, and approves only when switched on';
export async function run() {
  assert.ok(existsSync(VERIFY) && existsSync(ACT), 'a workflow source is absent');
  const strip = (f) => readFileSync(f, 'utf8').split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  const verify = strip(VERIFY), act = strip(ACT), code = `${verify}\n${act}`;
  assert.match(verify, /^on:\n {2}pull_request:\n {4}types: \[opened, synchronize, reopened, edited\]\n/m, 'verify does not trigger on pull_request with those types');
  assert.ok(!/^ {2}(push|pull_request_target|schedule|workflow_dispatch|merge_group|workflow_run):/m.test(verify), 'another trigger is present in verify');
  assert.match(act, /^on:\n {2}workflow_run:\n {4}workflows: \['sync verify'\]\n {4}types: \[completed\]\n/m, 'the acting workflow does not trigger on the completion of sync verify');
  assert.ok(!/^ {2}(push|pull_request|pull_request_target|schedule|workflow_dispatch|merge_group):/m.test(act), 'another trigger is present in the acting workflow');
  assert.match(verify, /^permissions: \{\}$/m, 'permissions are not empty at the top');
  assert.match(act, /^permissions: \{\}$/m, 'permissions are not empty at the top');
  for (const name of ['judge Sync', 'sign Sync', 'approve Sync', 'review Sync']) assert.ok(code.includes(`name: ${name}`), `the job ${name} is absent`);
  assert.equal([...verify.matchAll(/startsWith\(github\.event\.pull_request\.title, 'SYNC:'\)/g)].length, 1, 'verify does not run only for a SYNC');
  for (const lane of ['kaal/', 'hotfix/', 'wire/']) assert.ok(verify.includes(`startsWith(github.event.pull_request.base.ref, '${lane}')`), `the ${lane} base is not named`);
  assert.ok(act.includes('needs: [sign, approve]'), 'review does not need sign and approve');
  assert.ok(act.includes('ref: ${{ github.event.repository.default_branch }}') && verify.includes('ref: ${{ github.event.repository.default_branch }}'), 'the default branch is not checked out');
  assert.ok(code.includes('persist-credentials: false'), 'credentials persist');
  assert.ok(!/ref: \$\{\{ github\.(event\.pull_request|head_ref|event\.workflow_run)/.test(code), 'the candidate is checked out');
  assert.ok(act.includes('KAAL_SYNC_APPROVE'), 'the switch of approve Sync is absent');
  assert.ok(!/: write/.test(code.replace(/permission-(pull-requests|issues): write/g, '')), 'a write permission is present beyond the App token');
  assert.ok(!/gh pr merge|gh pr edit|git push|--force|\|\| true|--auto/i.test(code), 'a merge, an edit, a push or a swallowed failure is present');
  assert.equal([...code.matchAll(/continue-on-error/g)].length, 2, 'only the two artifact downloads may continue on error');
}
