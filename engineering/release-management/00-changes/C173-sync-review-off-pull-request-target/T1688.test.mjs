// Case release/T1688 tests: release/C173
import assert from 'node:assert/strict';
import { source, jobOf } from './fixture.mjs';
export const id = 'release/T1688';
export const tests = ['release/C173'];
export const title = 'approve Sync acts only after sign Sync posted success, and review Sync still runs and routes a SYNC to a person when signing was refused, failed or skipped';
export async function run() {
  const act = source('sync-act.yml');
  const approve = jobOf(act, 'approve Sync'), review = jobOf(act, 'review Sync');
  assert.ok(/needs: sign\b/.test(approve) && approve.includes("needs.sign.outputs.signed == 'success'"), 'approve does not wait for a signed success');
  assert.ok(/needs: \[sign, approve\]/.test(review) && /always\(\)/.test(review), 'review does not run whatever happened before it');
  assert.ok(!/needs\.sign\.outputs/.test(review.split('steps:')[0].replace(/always\(\)[^\n]*/, '')) , 'review is conditioned on the signature');
}
