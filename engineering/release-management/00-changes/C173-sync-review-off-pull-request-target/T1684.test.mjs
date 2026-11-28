// Case release/T1684 tests: release/C173
import assert from 'node:assert/strict';
import { source, sourceExists } from './fixture.mjs';
export const id = 'release/T1684';
export const tests = ['release/C173'];
export const title = 'the old sync-review.yml source is gone and the two new sources keep the job names verify Sync, approve Sync and review Sync';
export async function run() {
  assert.ok(!sourceExists('sync-review.yml'), 'the old source is still there');
  const code = source('sync-verify-plain.yml') + source('sync-act.yml');
  for (const n of ['verify Sync', 'approve Sync', 'review Sync']) assert.equal([...code.matchAll(new RegExp(`^    name: ${n}$`, 'gm'))].length, 1, `${n} is not exactly one job`);
}
