// Case engineering/T1750 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit } from './fixture.mjs';
export const id = 'engineering/T1750';
export const tests = ['engineering/F104'];
export const title = 'a push that lands reads what the push changed, at most three calls, and no list to its last page';
export async function run() {
  for (const ref of ['kaal/x', 'main']) {
    const { calls } = audit({ event: 'push', ref });
    assert.ok(calls.length >= 1 && calls.length <= 3, `a push to ${ref} made ${calls.length} GitHub calls: ${calls.join(' | ')}`);
    assert.ok(!calls.some((c) => /--paginate/.test(c)), `a push to ${ref} read a list to its last page`);
    assert.ok(!calls.some((c) => /pulls\?state=all/.test(c)), `a push to ${ref} read every pull request`);
    assert.ok(calls.some((c) => /commits\/[0-9a-f]{40}\/pulls/.test(c)), `a push to ${ref} did not ask which pull requests its commit belongs to`);
  }
}
