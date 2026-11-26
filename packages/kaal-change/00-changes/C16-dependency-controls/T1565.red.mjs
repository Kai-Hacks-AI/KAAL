// Case change/T1565 tests: change/G19
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, lib } from './fixtures.mjs';
export const id = 'change/T1565';
export const tests = ['change/G19'];
export const closes = ['change/G19'];
export const title = 'identify Conflict passes disjoint claimed paths, fails an unordered shared path naming it and both Changes, and reports an ordered one without failing it';
export async function run() {
  const { identifyConflict } = await lib('identify-conflict');
  const a = record('release/C1');
  const b = record('change/C2', succeeds(entry('release/C1', pinOf(a))));
  const free = (identity) => record(identity);
  const change = (identity, text, claimed) => ({ identity, text, claimed });
  const run1 = (...changes) => identifyConflict({ pinOf, changes });
  assert.equal((await run1(change('x/C1', free('x/C1'), ['a.md']), change('y/C2', free('y/C2'), ['b.md']))).kind, 'pass');
  const unordered = await run1(change('x/C1', free('x/C1'), ['a.md']), change('y/C2', free('y/C2'), ['a.md']));
  assert.equal(unordered.kind, 'fail');
  assert.deepEqual(unordered.findings.map((f) => [f.kind, f.path, f.changes]), [['conflict', 'a.md', ['x/C1', 'y/C2']]]);
  const ordered = await run1(change('release/C1', a, ['a.md']), change('change/C2', b, ['a.md']));
  assert.equal(ordered.kind, 'pass', 'a conflict that a declared edge orders does not fail');
  assert.deepEqual(ordered.findings.map((f) => [f.kind, f.path, f.before, f.after]), [['ordered', 'a.md', 'release/C1', 'change/C2']]);
}
test(id, () => run());
