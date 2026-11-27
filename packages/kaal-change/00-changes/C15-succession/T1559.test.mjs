// Case change/T1559 tests: change/G18
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, load, kinds } from './fixtures.mjs';
export const id = 'change/T1559';
export const tests = ['change/G18'];
export const closes = ['change/G18'];
export const title = 'the predecessor must exist and the pin must match its bytes; a stale pin is reported and never repaired';
export async function run() {
  const readSuccession = await load();
  const a = record('release/C1');
  const b = record('change/C2', succeeds(entry('release/C1', pinOf(a))));
  assert.deepEqual(kinds(readSuccession([{ identity: 'change/C2', text: b }], { pinOf })), ['unresolved']);
  const edited = a + 'an edit after the pin\n';
  const stale = readSuccession([{ identity: 'release/C1', text: edited }, { identity: 'change/C2', text: b }], { pinOf });
  assert.deepEqual(kinds(stale), ['stale']);
  assert.equal(stale.findings[0].pinned, pinOf(a));
  assert.equal(stale.findings[0].present, pinOf(edited));
  assert.deepEqual(stale.edges, [], 'a stale Edge is not an Edge, and no pin is rewritten');
  assert.deepEqual(kinds(readSuccession([{ identity: 'release/C1', text: a }, { identity: 'change/C2', text: b }], { pinOf })), []);
}
test(id, () => run());
