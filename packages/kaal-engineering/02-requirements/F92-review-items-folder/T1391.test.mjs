// Case engineering/T1391 tests: engineering/F92
import assert from 'node:assert/strict';
import { template } from '../F91-layout-complete/fixture.mjs';
export const id = 'engineering/T1391';
export const tests = ['engineering/F92'];
export const title = 'the template lists review-items beside test-cases in intent, requirements, architecture and defects';
export async function run() {
  const want = ['10-intent', '11-requirements', '12-architecture', '15-defects'];
  const folders = template().folders;
  for (const name of want) {
    const f = folders.find((x) => x.name === name);
    assert.ok(f && f.children.includes('review-items'), `${name} does not list review-items`);
    assert.ok(f.children.includes('test-cases'), `${name} lacks test-cases beside review-items`);
    assert.ok(!f.required || f.verifiedBy === 'test-cases', `${name}: review-items is the verifier`);
    assert.ok(f.verifiedBy !== 'review-items', `${name}: review-items is the verifier`);
  }
  assert.ok(!folders.some((f) => f.required && f.name === 'review-items'), 'review-items is required');
}
