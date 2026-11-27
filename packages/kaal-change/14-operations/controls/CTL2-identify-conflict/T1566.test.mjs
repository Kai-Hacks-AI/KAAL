// Case change/T1566 tests: change/G19
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, lib } from '../fixtures.mjs';
export const id = 'change/T1566';
export const tests = ['change/G19'];
export const closes = ['change/G19'];
export const title = 'identify Conflict is UNKNOWN when a claim or a record cannot be read, and only a valid edge orders a shared path and only a stated resolution resolves it';
export async function run() {
  const { identifyConflict } = await lib('identify-conflict');
  const a = record('release/C1');
  const free = (identity) => record(identity);
  const change = (identity, text, claimed) => ({ identity, text, claimed });
  const unknown = await identifyConflict({ pinOf, changes: [change('x/C1', free('x/C1'), ['a.md']), change('y/C2', free('y/C2'), null)] });
  assert.equal(unknown.kind, 'unknown');
  assert.deepEqual(unknown.findings.map((f) => [f.kind, f.change]), [['unreadable', 'y/C2']]);
  assert.equal((await identifyConflict({ pinOf: undefined, changes: [change('x/C1', free('x/C1'), ['a.md'])] })).kind, 'unknown');
  assert.equal((await identifyConflict({ pinOf, changes: [{ identity: 'x/C1', claimed: ['a.md'] }] })).kind, 'unknown', 'a record that cannot be read');
  // A stale edge orders nothing: the pin does not match the bytes the predecessor has.
  const stale = record('change/C2', succeeds(entry('release/C1', pinOf(a + 'older\n'))));
  const r = await identifyConflict({ pinOf, changes: [change('release/C1', a, ['a.md']), change('change/C2', stale, ['a.md'])] });
  assert.equal(r.kind, 'fail', 'a stale edge does not order a conflict');
  assert.equal(r.findings[0].ordered, false);
  // A cycle orders nothing: each Change declares the other, so no one lands first and a stated resolution is no resolution.
  const cyc = { 'x/C1': record('x/C1', succeeds(entry('y/C2', 'b'.repeat(64)))), 'y/C2': record('y/C2', succeeds(entry('x/C1', 'a'.repeat(64)))) };
  const asserted = (text) => ({ [cyc['x/C1']]: 'a'.repeat(64), [cyc['y/C2']]: 'b'.repeat(64) })[text];
  const cyclic = await identifyConflict({ pinOf: asserted, changes: [change('x/C1', cyc['x/C1'], ['a.md']), change('y/C2', cyc['y/C2'], ['a.md'])], resolved: [{ path: 'a.md', before: 'x/C1', after: 'y/C2' }, { path: 'a.md', before: 'y/C2', after: 'x/C1' }] });
  assert.equal(cyclic.kind, 'fail', 'a cyclic edge orders nothing and resolves nothing');
  assert.deepEqual(cyclic.findings.map((f) => [f.kind, f.ordered, f.resolved]), [['conflict', false, false]]);
  assert.equal((await identifyConflict({ pinOf, changes: [change('x/C1', free('x/C1'), ['a.md'])], resolved: 'x' })).kind, 'unknown', 'a resolution fact that cannot be read');
}
test(id, () => run());
