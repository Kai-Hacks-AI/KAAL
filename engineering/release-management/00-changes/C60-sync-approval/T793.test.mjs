// Case release/T793 tests: release/C60
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repo } from './fixtures.mjs';
export const id = 'release/T793';
export const tests = ['release/C60'];
export const title = 'the two settings of release/CTL8 are declared in settings.json equal to the draft, and the workflow source hands the outcome of approve Sync to review Sync';
export async function run() {
  const RM = join(repo, 'engineering/release-management');
  const file = join(RM, '05-src/sync-review/settings.json');
  assert.ok(existsSync(file), 'settings.json is absent');
  const draft = readFileSync(join(RM, '00-changes/C60-sync-approval/interface.md'), 'utf8').split(/^## settings\.json$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), JSON.parse(draft), 'settings.json differs from the draft');
  const s = JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(s.control, 'release/CTL8');
  assert.deepEqual(s.settings.map((x) => x.id), ['actions-may-approve', 'KAAL_SYNC_APPROVE']);
  const yml = readFileSync(join(RM, '05-src/wiring/workflows/sync-review.yml'), 'utf8');
  const job = (name) => yml.split(/^  (?=[a-z]+:\n    name: )/m).find((j) => j.includes(`name: ${name}`));
  const approve = job('approve Sync'), reviewJob = job('review Sync');
  assert.ok(/outputs:\n\s+approval: \$\{\{ steps\.[a-z-]+\.outputs\.approval \}\}/.test(approve), 'approve Sync hands its outcome on as the output approval');
  assert.ok(/needs: \[verify, approve\]/.test(reviewJob), 'review Sync waits for approve Sync');
  assert.ok(/always\(\)/.test(reviewJob), 'review Sync still runs when approve Sync failed');
  assert.ok(reviewJob.includes('KAAL_APPROVAL: ${{ needs.approve.outputs.approval }}'), 'review Sync reads the outcome');
  assert.ok(!/KAAL_APPROVAL/.test(approve), 'approve Sync does not read its own outcome');
  assert.ok(/pull-requests: write/.test(reviewJob) && /^permissions: \{\}/m.test(yml), 'permissions are unchanged');
}
