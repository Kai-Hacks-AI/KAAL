// Case pull/T431 tests: pull/F51
import assert from 'node:assert/strict';
import { pkg, facts, cand, verdict, authorities } from './lib.mjs';
export const id = 'pull/T431';
export const tests = ['pull/F51', 'pull/F52'];
export const title = 'OUT alone makes an item ready, from a consumed verdict; IN follows the pull and never gates selection';

export async function run() {
  const { resolveDeliveries } = await pkg();
  const side = (verdicts, s = 'stock', cls = 'HOTFIX') =>
    resolveDeliveries(facts({ candidates: [cand('x', cls, 'r1')], verdicts })).deliveries[0][s];
  const a = authorities.HOTFIX;
  assert.equal(side([verdict('x', 'stock', 'PASS', 'r1', a.stock)]), 'PASS');
  assert.equal(side([verdict('x', 'stock', 'FAIL', 'r1', a.stock)]), 'FAIL');
  assert.equal(side([]), 'UNKNOWN', 'no verdict');
  assert.equal(side([verdict('x', 'stock', 'PASS', 'r0', a.stock)]), 'UNKNOWN', 'another revision');
  assert.equal(side([verdict('x', 'stock', 'PASS', 'r1', 'someone-else')]), 'UNKNOWN', 'another authority');
  assert.equal(side([verdict('x', 'stock', 'PASS', 'r1', a.in)]), 'UNKNOWN', 'the authority of the other side');
  assert.equal(side([verdict('x', 'stock', 'held', 'r1', a.stock)]), 'UNKNOWN', 'held');
  assert.equal(side([verdict('x', 'stock', 'maybe', 'r1', a.stock)]), 'UNKNOWN', 'an unrecognised value');
  // The evidence behind a verdict is the class's own and is never read.
  for (const cls of ['KAAL', 'HOTFIX', 'WIRE']) {
    const v = { ...verdict('x', 'stock', 'PASS', 'r1', authorities[cls].stock), evidence: { anything: [cls, 1, null] } };
    assert.equal(side([v], 'stock', cls), 'PASS', `${cls} evidence was inspected`);
  }
  // IN follows the pull: it never gates selection.
  const one = (verdicts) => resolveDeliveries(facts({ candidates: [cand('x', 'HOTFIX', 'r1')], verdicts })).deliveries;
  const noIn = one([verdict('x', 'stock', 'PASS', 'r1', a.stock)]);
  assert.deepEqual([noIn[0].ready, noIn[0].in], [true, null], 'an item needs no IN verdict to be ready');
  const inPass = one([verdict('x', 'stock', 'PASS', 'r1', a.stock), verdict('x', 'in', 'PASS', 'r1', a.in)])[0];
  assert.deepEqual([inPass.ready, inPass.in], [true, 'PASS']);
  const inFail = one([verdict('x', 'stock', 'PASS', 'r1', a.stock), verdict('x', 'in', 'FAIL', 'r1', a.in)]);
  assert.equal(inFail.length, 1, 'a failed IN removed the item');
  assert.deepEqual([inFail[0].ready, inFail[0].in], [true, 'FAIL']);
  const withOut = one([verdict('x', 'stock', 'PASS', 'r1', a.stock), verdict('x', 'out', 'FAIL', 'r1', a.out)])[0];
  assert.deepEqual([withOut.ready, withOut.out], [true, 'FAIL'], 'a PR-creation verdict gated selection');
  const onlyIn = one([verdict('x', 'in', 'PASS', 'r1', a.in)])[0];
  assert.deepEqual([onlyIn.ready, onlyIn.stock], [false, 'UNKNOWN'], 'IN made an item ready');
  assert.equal(one([verdict('x', 'in', 'PASS', 'r0', a.in)])[0].in, 'UNKNOWN', 'an IN verdict at another revision');
}
