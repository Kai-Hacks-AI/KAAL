// Case pull/T431 tests: pull/F51
import assert from 'node:assert/strict';
import { pkg, facts, cand, verdict, authorities } from './lib.mjs';
export const id = 'pull/T431';
export const tests = ['pull/F51'];
export const title = 'OUT and IN are consumed verdicts at the exact revision from the registered authority';

export async function run() {
  const { resolveDeliveries } = await pkg();
  const side = (verdicts, s = 'out', cls = 'HOTFIX') =>
    resolveDeliveries(facts({ candidates: [cand('x', cls, 'r1')], verdicts })).deliveries[0][s];
  const a = authorities.HOTFIX;
  assert.equal(side([verdict('x', 'out', 'PASS', 'r1', a.out)]), 'PASS');
  assert.equal(side([verdict('x', 'in', 'PASS', 'r1', a.in)], 'in'), 'PASS');
  assert.equal(side([verdict('x', 'out', 'FAIL', 'r1', a.out)]), 'FAIL');
  assert.equal(side([]), 'UNKNOWN', 'no verdict');
  assert.equal(side([verdict('x', 'out', 'PASS', 'r0', a.out)]), 'UNKNOWN', 'another revision');
  assert.equal(side([verdict('x', 'out', 'PASS', 'r1', 'someone-else')]), 'UNKNOWN', 'another authority');
  assert.equal(side([verdict('x', 'out', 'PASS', 'r1', a.in)]), 'UNKNOWN', 'the authority of the other side');
  assert.equal(side([verdict('x', 'out', 'held', 'r1', a.out)]), 'UNKNOWN', 'held');
  assert.equal(side([verdict('x', 'out', 'maybe', 'r1', a.out)]), 'UNKNOWN', 'an unrecognised value');
  // The evidence behind a verdict is the class's own and is never read.
  for (const cls of ['KAAL', 'HOTFIX', 'WIRE']) {
    const v = { ...verdict('x', 'out', 'PASS', 'r1', authorities[cls].out), evidence: { anything: [cls, 1, null] } };
    assert.equal(side([v], 'out', cls), 'PASS', `${cls} evidence was inspected`);
  }
}
