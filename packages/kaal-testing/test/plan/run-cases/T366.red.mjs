// Case testing/T366 tests: testing/F142. Completeness and execution problems.
import assert from 'node:assert/strict';
import { find, fx, load, runFx } from './lib.mjs';
export const id = 'testing/T366';
export const tests = ['testing/F142'];
export const title = 'a file that cannot be run or ends badly is an execution problem that makes the report incomplete, keeps what was observed, and never makes up a RED';
export async function run() {
  const l = await runFx(['loaderror']);
  assert.equal(l.execution.complete, false);
  assert.deepEqual(l.counts, { GREEN: 0, RED: 0, UNKNOWN: 0 }, 'a load error is not a Case result');
  assert.deepEqual(l.tests, []);
  const p = l.execution.problems.find((x) => x.file === fx('loaderror'));
  assert.equal(p?.kind, 'file-failed');
  assert.ok(typeof p.detail === 'string' && p.detail !== '', 'the diagnostic is kept');

  const c = await runFx(['crash']);
  assert.equal(c.execution.complete, false);
  assert.equal(c.counts.RED, 0, 'a crash makes up no RED');
  assert.ok(c.execution.problems.some((x) => x.kind === 'file-failed' && x.file === fx('crash')));
  assert.equal(find(c, 'crash', 'never reached'), undefined, 'a test that never ran is not invented');

  const late = await runFx(['late']);
  assert.equal(late.execution.complete, false);
  assert.equal(find(late, 'late', 'green one').actual, 'GREEN', 'results observed before a late error are kept');
  assert.ok(late.execution.problems.some((x) => x.kind === 'file-failed' && x.file === fx('late')));

  const e = await runFx(['empty']);
  assert.equal(e.execution.complete, false);
  assert.deepEqual(e.tests, [], 'the file-level result of a file with no tests is not a test');
  assert.ok(e.execution.problems.some((x) => x.kind === 'empty-inventory' && x.file === fx('empty')));

  const both = await runFx(['green', 'loaderror']);
  assert.deepEqual(both.counts, { GREEN: 2, RED: 0, UNKNOWN: 0 }, 'one bad file does not erase the others');
  assert.equal(both.execution.complete, false);
  assert.deepEqual(both.execution.problems.map((x) => x.file), [fx('loaderror')]);

  const ok = await runFx(['green', 'mixed']);
  assert.equal(ok.execution.complete, true);
  assert.deepEqual(ok.execution.problems, []);

  const { reconstruct, runCases } = await load();
  const bad = reconstruct([{ type: 'pass', name: 'x', nesting: 2, line: 3, column: 1, testNumber: 1, kind: 'test', skip: false, todo: false }], 'f.mjs');
  assert.ok(bad.problems.some((x) => x.kind === 'unrecognised-output'), 'a stream that cannot be reconstructed is an execution problem, not a guess');

  for (const input of [{ files: [], root: process.cwd() }, { files: [fx('green')], root: 'relative' }, { files: ['does/not/exist.mjs'], root: process.cwd() }, { files: ['../outside.mjs'], root: process.cwd() }, {}])
    await assert.rejects(runCases(input), `invalid input is rejected with no report: ${JSON.stringify(input)}`);
}
