// Case change/T1563 tests: change/G19
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinOf, record, entry, succeeds, rec, lib } from './fixtures.mjs';
export const id = 'change/T1563';
export const tests = ['change/G19'];
export const closes = ['change/G19'];
export const title = 'check Predecessor passes a predecessor on main at its pin or carried together with it, and fails every other case, naming it';
export async function run() {
  const { checkPredecessor } = await lib('check-predecessor');
  const a = record('release/C1');
  const edge = (extra = '') => rec('change/C2', record('change/C2', succeeds(entry('release/C1', pinOf(a), extra || undefined))));
  const run1 = (f) => checkPredecessor({ pinOf, main: [], carried: [], elsewhere: [], ...f });
  assert.equal((await run1({ main: [rec('release/C1', a)], carried: [edge()] })).kind, 'pass', 'on main at its pin');
  assert.equal((await run1({ carried: [rec('release/C1', a), edge()] })).kind, 'pass', 'carried together with it');
  assert.equal((await run1({ carried: [rec('change/C2', record('change/C2'))] })).kind, 'pass', 'no declared prerequisite');
  const absent = await run1({ carried: [edge()] });
  assert.equal(absent.kind, 'fail');
  assert.deepEqual(absent.findings.map((f) => [f.kind, f.change, f.predecessor]), [['unresolved', 'change/C2', 'release/C1']]);
  const stale = await run1({ main: [rec('release/C1', a + 'edited\n')], carried: [edge()] });
  assert.equal(stale.kind, 'fail');
  assert.deepEqual(stale.findings.map((f) => f.kind), ['stale']);
  const elsewhere = await run1({ elsewhere: [rec('release/C1', a)], carried: [edge()] });
  assert.equal(elsewhere.kind, 'fail');
  assert.deepEqual(elsewhere.findings.map((f) => f.kind), ['elsewhere'], 'a predecessor only a Change elsewhere holds is not delivered');
  const soft = await run1({ main: [rec('release/C1', a)], carried: [rec('change/C2', record('change/C2', succeeds(entry('release/C1', pinOf(a), ''))))] });
  assert.equal(soft.kind, 'fail');
  assert.deepEqual(soft.findings.map((f) => f.kind), ['not-hard']);
}
test(id, () => run());
