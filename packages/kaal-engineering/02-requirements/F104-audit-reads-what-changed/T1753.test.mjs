// Case engineering/T1753 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit } from './fixture.mjs';
export const id = 'engineering/T1753';
export const tests = ['engineering/F104'];
export const title = 'the creation of a collector reads the activity of the default branch only, and no pull request list';
export async function run() {
  const { calls } = audit({ event: 'push', ref: 'kaal/x', created: 'true' });
  assert.ok(calls.some((c) => /repos\/o\/r\/activity/.test(c) && /[?&]ref=(refs(%2F|\/)heads(%2F|\/))?main\b/.test(c)), `no read of the default branch's activity: ${calls.join(' | ')}`);
  assert.ok(!calls.some((c) => /pulls\?state=all/.test(c)), 'the creation of a collector read every pull request');
  assert.ok(!calls.some((c) => /repos\/o\/r\/activity[^ ]*per_page=100(?![^ ]*ref=)/.test(c)), 'the creation read the activity of every branch');
}
