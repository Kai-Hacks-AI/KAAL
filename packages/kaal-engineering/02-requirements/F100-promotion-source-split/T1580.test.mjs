// Case engineering/T1580 tests: engineering/F100
import assert from 'node:assert/strict';
import { base, lineage } from './fixture.mjs';
export const id = 'engineering/T1580';
export const tests = ['engineering/F100'];
export const title = 'promotionOrigin is exported and says where a head branch comes from, with its delivery stock';
export async function run() {
  const { promotionOrigin } = await lineage();
  assert.equal(typeof promotionOrigin, 'function', 'promotionOrigin is exported');
  assert.equal(promotionOrigin({ ...base, baseRef: 'kaal/y', headRef: 'claude/z' }).kind, 'not-applicable');
  for (const [headRef, stock] of [['kaal/x/y', 'kaal'], ['hotfix/z', 'hotfix'], ['wire/w', 'wire']]) {
    const v = promotionOrigin({ ...base, headRef });
    assert.equal(v.kind, 'pass', headRef);
    assert.equal(v.stock, stock, headRef);
  }
  const dev = promotionOrigin({ ...base, headRef: 'claude/z' });
  assert.equal(dev.kind, 'fail');
  assert.equal(dev.stock, null);
  assert.ok(dev.message.includes('engineering/github/branching.md'), 'points to the guide');
  const fork = promotionOrigin({ ...base, headRepo: 'x/r', headRef: 'kaal/x/y' });
  assert.equal(fork.kind, 'fail');
  assert.equal(fork.stock, null);
}
