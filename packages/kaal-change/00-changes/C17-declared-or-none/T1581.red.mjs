// Case change/T1581 tests: change/G20
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, rec, lib } from './fixtures.mjs';
export const id = 'change/T1581';
export const tests = ['change/G20'];
export const closes = ['change/G20'];
export const title = 'check Predecessor can require the answer: an undeclared carried Change fails, an explicit none passes and says it was declared, and a require it cannot read is UNKNOWN';
export async function run() {
  const { checkPredecessor } = await lib('check-predecessor');
  const base = { pinOf, main: [], elsewhere: [], delivered: [] };
  const silent = rec('change/C2', record('change/C2'));
  const none = rec('change/C2', record('change/C2', 'succeeds: []\n'));
  const before = await checkPredecessor({ ...base, carried: [silent] });
  assert.equal(before.kind, 'pass', 'without require the behaviour is unchanged');
  assert.match(before.note, /no declared prerequisite/i);
  const undeclared = await checkPredecessor({ ...base, carried: [silent], require: ['change/C2'] });
  assert.equal(undeclared.kind, 'fail');
  assert.deepEqual(undeclared.findings.map((f) => [f.kind, f.change]), [['undeclared', 'change/C2']]);
  const declared = await checkPredecessor({ ...base, carried: [none], require: ['change/C2'] });
  assert.equal(declared.kind, 'pass');
  assert.match(declared.note, /declared none/i, 'a declared none is a statement, not the absence of one');
  for (const bad of ['change/C2', [1], null]) {
    const r = await checkPredecessor({ ...base, carried: [none], require: bad });
    assert.equal(r.kind, 'unknown', JSON.stringify(bad));
    assert.ok(r.findings.length > 0);
  }
}
test(id, () => run());
