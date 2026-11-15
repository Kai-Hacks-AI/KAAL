// Case pull/T431 tests: pull/F51
import assert from 'node:assert/strict';
import { script, authorities, verdict } from './lib.mjs';
export const id = 'pull/T431';
export const tests = ['pull/F51'];
export const title = 'OUT is a consumed verdict at the exact head, with the class evidence left alone';

export async function run() {
  const { gatherDeliveries } = await script();
  const out = (verdicts, ref = 'hotfix/x', cls = 'HOTFIX') => gatherDeliveries({ heads: [{ ref, sha: 'h' }], verdicts, authorities, prs: [], checks: [], destination: { required: [] } }).deliveries[0].out;
  const a = authorities.HOTFIX;
  assert.equal(out([verdict('hotfix/x', 'PASS', 'h', a)]), 'PASS');
  assert.equal(out([verdict('hotfix/x', 'FAIL', 'h', a)]), 'FAIL');
  assert.equal(out([]), 'UNKNOWN', 'no verdict');
  assert.equal(out([verdict('hotfix/x', 'PASS', 'old', a)]), 'UNKNOWN', 'another revision');
  assert.equal(out([verdict('hotfix/x', 'PASS', 'h', 'someone-else')]), 'UNKNOWN', 'another authority');
  assert.equal(out([verdict('hotfix/x', 'held', 'h', a)]), 'UNKNOWN', 'held');
  assert.equal(out([verdict('hotfix/x', 'maybe', 'h', a)]), 'UNKNOWN', 'an unrecognised value');
  // The evidence behind a verdict is the class's own and is never read.
  for (const [ref, key] of [['kaal/a/b', 'KAAL'], ['hotfix/x', 'HOTFIX'], ['wire/y', 'WIRE']]) {
    const v = { ...verdict(ref, 'PASS', 'h', authorities[key]), evidence: { anything: [ref, 1, null] } };
    assert.equal(out([v], ref), 'PASS', `${key} evidence was inspected`);
  }
}
