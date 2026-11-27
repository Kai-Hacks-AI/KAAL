// Case change/T1557 tests: change/G18
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, load } from './fixtures.mjs';
export const id = 'change/T1557';
export const tests = ['change/G18'];
export const closes = ['change/G18'];
export const title = 'a record states the Changes it succeeds as entries with the predecessor, its pin and why it is hard';
export async function run() {
  const readSuccession = await load();
  const a = record('release/C1');
  const b = record('change/C2', succeeds(entry('release/C1', pinOf(a), 'the Case reads a file only C1 adds')));
  const r = readSuccession([{ identity: 'release/C1', text: a }, { identity: 'change/C2', text: b }], { pinOf });
  assert.deepEqual(r.findings, []);
  assert.deepEqual(r.edges, [{ from: 'change/C2', to: 'release/C1', pin: pinOf(a), because: 'the Case reads a file only C1 adds' }]);
  assert.deepEqual(readSuccession([{ identity: 'release/C1', text: a }], { pinOf }).edges, []);
}
test(id, () => run());
