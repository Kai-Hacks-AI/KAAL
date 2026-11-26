// Case change/T1565 tests: change/G19
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, lib } from './fixtures.mjs';
export const id = 'change/T1565';
export const tests = ['change/G19'];
export const closes = ['change/G19'];
export const title = 'identify Conflict fails every unresolved shared path, ordered or not, and distinguishes ordering from resolution; only synchronization resolves';
export async function run() {
  const { identifyConflict } = await lib('identify-conflict');
  const a = record('release/C1');
  const b = record('change/C2', succeeds(entry('release/C1', pinOf(a))));
  const free = (identity) => record(identity);
  const change = (identity, text, claimed) => ({ identity, text, claimed });
  const run1 = (changes, resolved) => identifyConflict({ pinOf, changes, ...(resolved ? { resolved } : {}) });
  assert.equal((await run1([change('x/C1', free('x/C1'), ['a.md']), change('y/C2', free('y/C2'), ['b.md'])])).kind, 'pass');
  const unordered = await run1([change('x/C1', free('x/C1'), ['a.md']), change('y/C2', free('y/C2'), ['a.md'])]);
  assert.equal(unordered.kind, 'fail');
  assert.deepEqual(unordered.findings.map((f) => [f.kind, f.path, f.changes, f.ordered, f.resolved]), [['conflict', 'a.md', ['x/C1', 'y/C2'], false, false]]);
  const two = [change('release/C1', a, ['a.md']), change('change/C2', b, ['a.md'])];
  const ordered = await run1(two);
  assert.equal(ordered.kind, 'fail', 'a declared edge orders the Changes but does not resolve the overlap');
  assert.deepEqual(ordered.findings.map((f) => [f.kind, f.path, f.before, f.after, f.ordered, f.resolved]), [['conflict', 'a.md', 'release/C1', 'change/C2', true, false]]);
  const resolved = await run1(two, [{ path: 'a.md', before: 'release/C1', after: 'change/C2' }]);
  assert.equal(resolved.kind, 'pass', 'synchronization established the resolution');
  assert.deepEqual(resolved.findings.map((f) => [f.kind, f.path, f.before, f.after]), [['resolved', 'a.md', 'release/C1', 'change/C2']]);
  const wrong = await run1([change('x/C1', free('x/C1'), ['a.md']), change('y/C2', free('y/C2'), ['a.md'])], [{ path: 'a.md', before: 'x/C1', after: 'y/C2' }]);
  assert.equal(wrong.kind, 'fail', 'a resolution is not claimed for Changes no edge orders');
}
test(id, () => run());
