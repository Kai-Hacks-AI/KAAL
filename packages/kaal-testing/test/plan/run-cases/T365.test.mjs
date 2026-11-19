// Case testing/T365 tests: testing/F140, testing/F141. Identity, duplicate names and Case attribution.
import assert from 'node:assert/strict';
import { fx, find, runFx } from './lib.mjs';
export const id = 'testing/T365';
export const tests = ['testing/F140', 'testing/F141'];
export const title = 'a test is identified by file, ancestors, name and ordinal; a duplicate name is reported; a Case is attributed only from a leading Case form and a conflict attributes none';
export async function run() {
  const n = await runFx(['nested']);
  const ids = n.tests.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique within a report');
  const first = find(n, 'nested', ['suite A', 'inner', 'dup']);
  const second = n.tests.find((t) => t.id === `${fx('nested')} > suite A > inner > dup #2`);
  assert.ok(first && second, 'same-named siblings are told apart by an ordinal, the first without one');
  assert.equal(first.actual, 'GREEN');
  assert.equal(second.actual, 'RED');
  assert.ok(n.tests.every((t) => t.id.startsWith(`${fx('nested')} > `) && t.file === fx('nested')), 'ids start with the repo-relative path with / separators');
  const dup = n.diagnostics.filter((d) => d.kind === 'duplicate-name');
  assert.equal(dup.length, 1, 'a duplicate name is a diagnostic');
  assert.deepEqual(dup[0].ids, [first.id, second.id]);
  assert.deepEqual(n.diagnostics.filter((d) => d.kind !== 'duplicate-name'), []);

  const m = await runFx(['mixed']);
  assert.deepEqual(find(m, 'mixed', 'T1 red').case, { namespace: null, number: 1, raw: 'T1' });

  const k = await runFx(['names']);
  assert.deepEqual(find(k, 'names', 'testing/T157 own form').case, { namespace: 'testing', number: 157, raw: 'testing/T157' });
  assert.deepEqual(find(k, 'names', 'T9 bare form').case, { namespace: null, number: 9, raw: 'T9' });
  assert.equal(find(k, 'names', 'no form here').case, null);
  assert.equal(find(k, 'names', 'Tabc is not a form').case, null, 'T followed by something other than a number is no reference');
  assert.deepEqual(find(k, 'names', ['controls/T14 suite reference', 'plain child']).case, { namespace: 'controls', number: 14, raw: 'controls/T14' }, 'a leading form on an ancestor attributes its children');
  const conflicted = find(k, 'names', ['controls/T14 suite reference', 'review/T21 conflicting child']);
  assert.equal(conflicted.case, null, 'two different references attribute no Case');
  const d = k.diagnostics.filter((x) => x.kind === 'conflicting-case-reference');
  assert.equal(d.length, 1);
  assert.equal(d[0].id, conflicted.id);
  assert.deepEqual([...d[0].references].sort(), ['controls/T14', 'review/T21']);
  assert.ok(k.tests.every((t) => t.case === null || typeof t.case.number === 'number'), 'attribution comes from names, never from the file name');
  assert.deepEqual(k.counts, { GREEN: 6, RED: 0, UNKNOWN: 0 }, 'counts are test counts, whatever the attribution');
}
