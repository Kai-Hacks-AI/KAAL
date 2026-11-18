// Case release/T757 tests: release/C58
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const WORKFLOW = join(RM, '05-src/wiring/workflows/sync-review.yml');
export const id = 'release/T757';
export const tests = ['release/C58'];
export const title = 'the workflow source runs the three controls only for a SYNC into an integration branch, judges from the default branch, writes only to the pull request, and approves only when switched on';
export async function run() {
  assert.ok(existsSync(WORKFLOW), 'the workflow source is absent');
  const y = readFileSync(WORKFLOW, 'utf8');
  const code = y.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  assert.match(code, /^on:\n {2}pull_request_target:\n {4}types: \[opened, synchronize, reopened, edited\]\n/m, 'the trigger is not exactly pull_request_target with those types');
  assert.ok(!/^ {2}(push|pull_request|schedule|workflow_dispatch|merge_group|workflow_run):/m.test(code), 'another trigger is present');
  assert.match(code, /^permissions: \{\}$/m, 'permissions are not empty at the top');
  for (const name of ['verify Sync', 'approve Sync', 'review Sync']) assert.ok(code.includes(`name: ${name}`), `the job ${name} is absent`);
  assert.equal([...code.matchAll(/startsWith\(github\.event\.pull_request\.title, 'SYNC:'\)/g)].length, 3, 'a job does not run only for a SYNC');
  for (const lane of ['kaal/', 'hotfix/', 'wire/']) assert.ok(code.includes(`startsWith(github.event.pull_request.base.ref, '${lane}')`), `the ${lane} base is not named`);
  assert.equal([...code.matchAll(/needs: verify$/gm)].length, 1, 'approve does not need verify'); // release/C60: review also waits for approve
  assert.ok(code.includes('needs: [verify, approve]'), 'review does not need verify and approve');
  assert.ok(code.includes('ref: ${{ github.event.repository.default_branch }}'), 'the default branch is not checked out');
  assert.ok(code.includes('persist-credentials: false'), 'credentials persist');
  assert.ok(!/ref: \$\{\{ github\.event\.pull_request/.test(code), 'the candidate is checked out');
  assert.ok(code.includes('KAAL_SYNC_APPROVE'), 'the switch of approve Sync is absent');
  assert.equal([...code.matchAll(/contents: read/g)].length >= 1, true);
  assert.equal([...code.matchAll(/pull-requests: write/g)].length, 2, 'only approve and review write to the pull request');
  assert.ok(!/: write/.test(code.replace(/pull-requests: write/g, '')), 'another write permission is present');
  assert.ok(!/gh pr merge|gh pr edit|git push|--force|continue-on-error|\|\| true|--auto/i.test(code), 'a merge, an edit, a push or a swallowed failure is present');
}
