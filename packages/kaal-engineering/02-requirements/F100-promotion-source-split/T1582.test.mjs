// Case engineering/T1582 tests: engineering/F100
import assert from 'node:assert/strict';
import { A, base, lineage, required, run as runOf } from './fixture.mjs';
export const id = 'engineering/T1582';
export const tests = ['engineering/F100'];
export const title = 'promotionSource gives the same verdict as promotionOrigin followed by notGreen';
export async function run() {
  const { promotionOrigin, notGreen, promotionSource } = await lineage();
  assert.equal(typeof promotionOrigin, 'function', 'promotionOrigin is exported');
  assert.equal(typeof notGreen, 'function', 'notGreen is exported');
  const cases = [
    { ...base, headRepo: 'x/r', headRef: 'kaal/x/y', head: A },
    { ...base, headRef: 'claude/z', head: A },
    { ...base, headRef: 'kaal/x/y', head: A },
    { ...base, headRef: 'kaal/x/y', head: A, checks: { required, runs: [runOf()] } },
    { ...base, headRef: 'kaal/x/y', head: A, checks: { required, runs: [runOf({ conclusion: 'failure' })] } },
  ];
  for (const f of cases) {
    const o = promotionOrigin(f);
    const expected = o.kind !== 'pass' ? o.kind : f.checks === undefined ? 'fail' : notGreen(f.head, f.checks).length > 0 ? 'fail' : 'pass';
    assert.equal(promotionSource(f).kind, expected, JSON.stringify(f.headRef) + ' ' + expected);
  }
}
