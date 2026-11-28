// Case engineering/T1751 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit } from './fixture.mjs';
export const id = 'engineering/T1751';
export const tests = ['engineering/F104'];
export const title = 'the deletion of a branch is judged by nothing and reads nothing from GitHub';
export async function run() {
  const { calls } = audit({ event: 'push', ref: 'kaal/x', deleted: 'true' });
  assert.deepEqual(calls, [], `a deletion made GitHub calls: ${calls.join(' | ')}`);
}
