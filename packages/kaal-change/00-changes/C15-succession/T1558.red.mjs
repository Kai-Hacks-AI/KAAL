// Case change/T1558 tests: change/G18
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, load, kinds } from './fixtures.mjs';
export const id = 'change/T1558';
export const tests = ['change/G18'];
export const closes = ['change/G18'];
export const title = 'only a hard dependency is declared: an entry without a reason, or one that is malformed or repeated, is a finding';
export async function run() {
  const readSuccession = await load();
  const a = record('release/C1');
  const at = (extra) => readSuccession([{ identity: 'release/C1', text: a }, { identity: 'change/C2', text: record('change/C2', extra) }], { pinOf });
  const p = pinOf(a);
  assert.deepEqual(kinds(at(succeeds(entry('release/C1', p, '')))), ['not-hard']);
  assert.deepEqual(kinds(at('succeeds:\n  - change: release/C1\n    pin: ' + p + '\n')), ['not-hard']);
  assert.deepEqual(kinds(at(succeeds(entry('release/C1', 'nothex')))), ['malformed']);
  assert.deepEqual(kinds(at(succeeds(entry('C1', p)))), ['malformed']);
  assert.deepEqual(kinds(at(succeeds(entry('release/C1', p), entry('release/C1', p)))), ['duplicate']);
  const f = at(succeeds(entry('release/C1', p, ''))).findings[0];
  assert.equal(f.change, 'change/C2');
  assert.equal(f.predecessor, 'release/C1');
}
test(id, () => run());
