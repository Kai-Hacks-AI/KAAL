// Case pull/T431 tests: pull/F51
import assert from 'node:assert/strict';
import { pkg, facts, cand, verdict, authorities } from './lib.mjs';
export const id = 'pull/T431';
export const tests = ['pull/F51'];
export const title = 'an item is ready only on a STOCK verdict at its exact revision from the registered authority';

export async function run() {
  const { resolveDeliveries } = await pkg();
  const ready = (verdicts, cls = 'HOTFIX') => resolveDeliveries(facts({ candidates: [cand('x', cls, 'r1')], verdicts })).deliveries[0].ready;
  const a = authorities.HOTFIX;
  assert.equal(ready([verdict('x', 'PASS', 'r1', a)]), true);
  assert.equal(ready([]), false, 'no verdict');
  assert.equal(ready([verdict('x', 'PASS', 'r0', a)]), false, 'another revision');
  assert.equal(ready([verdict('x', 'PASS', 'r1', 'someone-else')]), false, 'another authority');
  assert.equal(ready([verdict('x', 'FAIL', 'r1', a)]), false);
  assert.equal(ready([verdict('x', 'held', 'r1', a)]), false, 'held');
  assert.equal(ready([verdict('x', 'maybe', 'r1', a)]), false, 'an unrecognised value');
  // The evidence behind a verdict is the class's own and is never read; OUT and IN are neither needed nor read.
  for (const cls of ['KAAL', 'HOTFIX', 'WIRE']) {
    const v = { ...verdict('x', 'PASS', 'r1', authorities[cls]), evidence: { anything: [cls, 1, null] }, out: 'FAIL', in: 'FAIL' };
    assert.equal(ready([v], cls), true, `${cls} evidence, OUT or IN was read`);
  }
}
