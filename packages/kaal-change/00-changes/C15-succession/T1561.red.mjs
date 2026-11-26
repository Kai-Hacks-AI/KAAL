// Case change/T1561 tests: change/G18
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, load, kinds } from './fixtures.mjs';
export const id = 'change/T1561';
export const tests = ['change/G18'];
export const closes = ['change/G18'];
export const title = 'only the successor states it: successors are derived, and overlaps are never declared';
export async function run() {
  const readSuccession = await load();
  const a = record('release/C1');
  const b = record('change/C2', succeeds(entry('release/C1', pinOf(a))));
  const r = readSuccession([{ identity: 'release/C1', text: a }, { identity: 'change/C2', text: b }], { pinOf });
  assert.deepEqual(r.successors('release/C1'), ['change/C2']);
  assert.deepEqual(r.successors('change/C2'), []);
  for (const key of ['successors', 'succeededBy', 'precedes']) {
    const bad = record('release/C1', `${key}:\n  - change/C2\n`);
    assert.deepEqual(kinds(readSuccession([{ identity: 'release/C1', text: bad }], { pinOf })), ['derived-stated'], key);
  }
  for (const key of ['overlaps', 'conflicts', 'files']) {
    const bad = record('change/C2', `${key}:\n  - a/b.md\n`);
    assert.deepEqual(kinds(readSuccession([{ identity: 'change/C2', text: bad }], { pinOf })), ['overlap-stated'], key);
  }
}
test(id, () => run());
