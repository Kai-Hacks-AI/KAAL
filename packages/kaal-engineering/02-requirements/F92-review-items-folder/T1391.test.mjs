// Case engineering/T1391 tests: engineering/F92
import assert from 'node:assert/strict';
import { template } from '../F91-layout-complete/fixture.mjs';
export const id = 'engineering/T1391';
export const tests = ['engineering/F92'];
export const title = 'the template lists review-items beside test-cases in intent, requirements, architecture and defects, and in no other folder';
export async function run() {
  const want = ['10-intent', '11-requirements', '12-architecture', '15-defects'];
  for (const f of template().folders) {
    const has = (f.children ?? []).includes('review-items');
    assert.equal(has, want.includes(f.name), `${f.name} ${has ? 'lists' : 'does not list'} review-items`);
    if (has) assert.ok(f.children.includes('test-cases'), `${f.name} lacks test-cases beside review-items`);
    assert.ok(!f.required || !has || f.verifiedBy === 'test-cases', `${f.name}: review-items is the verifier`);
  }
}
