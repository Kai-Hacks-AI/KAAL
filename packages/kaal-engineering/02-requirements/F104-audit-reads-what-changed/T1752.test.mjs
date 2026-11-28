// Case engineering/T1752 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit } from './fixture.mjs';
export const id = 'engineering/T1752';
export const tests = ['engineering/F104'];
export const title = 'the daily run still reads every activity record and every pull request to the last page';
export async function run() {
  const { calls } = audit({ event: 'schedule' });
  assert.ok(calls.some((c) => /--paginate/.test(c) && /repos\/o\/r\/activity/.test(c)), 'the daily run does not read the activity to its last page');
  assert.ok(calls.some((c) => /--paginate/.test(c) && /repos\/o\/r\/pulls\?state=all/.test(c)), 'the daily run does not read the pull requests to their last page');
}
