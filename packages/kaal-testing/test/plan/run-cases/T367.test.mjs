// Case testing/T367 tests: testing/F143. compareReports.
import assert from 'node:assert/strict';
import { fx, load, runFx } from './lib.mjs';
export const id = 'testing/T367';
export const tests = ['testing/F143'];
export const title = 'comparing two reports lists every changed outcome, addition and removal, marks them provisional where a side was incomplete, and gives no verdict';
const clone = (r) => structuredClone(r);
export async function run() {
  const { compareReports } = await load();
  const base = await runFx(['mixed']);
  const same = compareReports(base, clone(base));
  assert.deepEqual([same.changed, same.added, same.removed], [[], [], []]);
  assert.equal(same.complete, true);

  const head = clone(base);
  for (const t of head.tests) t.actual = t.actual === 'RED' && t.id.endsWith('T1 red') ? 'GREEN' : t.id.endsWith('T2 control') ? 'RED' : t.actual;
  head.counts = { GREEN: 1, RED: 2, UNKNOWN: 0 };
  assert.deepEqual(head.counts, base.counts, 'equal counts');
  const diff = compareReports(base, head);
  assert.deepEqual(diff.changed.map((x) => [x.id.split(' > ').pop(), x.from, x.to]).sort(), [['T1 red', 'RED', 'GREEN'], ['T2 control', 'GREEN', 'RED']], 'equal counts do not hide a regression');

  const grown = clone(base);
  const extra = clone(base.tests[0]);
  extra.id = `${extra.file} > a new test`;
  grown.tests.push(extra);
  grown.tests = grown.tests.filter((t) => !t.id.endsWith('T3 red'));
  const move = compareReports(base, grown);
  assert.deepEqual(move.added.map((x) => x.id), [extra.id]);
  assert.deepEqual(move.removed.map((x) => x.id.split(' > ').pop()), ['T3 red'], 'a rename is a removal plus an addition');
  assert.ok([...move.added, ...move.removed].every((x) => x.provisional === false), 'both sides complete: not provisional');

  const broken = clone(base);
  broken.execution = { ...broken.execution, complete: false, problems: [{ file: fx('mixed'), kind: 'file-failed', detail: 'x' }] };
  broken.tests = [];
  const against = compareReports(broken, base);
  assert.equal(against.added.length, 3);
  assert.ok(against.added.every((x) => x.provisional === true), 'additions against an incomplete base are provisional');
  assert.equal(against.complete, false);
  assert.deepEqual(against.problems.base, broken.execution.problems, 'each side keeps its problems');
  assert.deepEqual(against.problems.head, []);
  const lost = compareReports(base, broken);
  assert.equal(lost.removed.length, 3);
  assert.ok(lost.removed.every((x) => x.provisional === true), 'removals into an incomplete head are provisional');

  const unrun = clone(base);
  unrun.execution = { ...unrun.execution, files: [] };
  unrun.tests = [];
  assert.ok(compareReports(unrun, base).added.every((x) => x.provisional === true), 'a file one side never ran is provisional too');

  for (const k of ['verdict', 'ok', 'accepted', 'pass', 'passed', 'regression']) assert.ok(!(k in diff), `no judgment: ${k}`);
  assert.ok(Array.isArray(diff.diagnostics?.base) && Array.isArray(diff.diagnostics?.head), 'each side keeps its diagnostics');
}
