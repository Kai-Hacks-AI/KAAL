// Case testing/T364 tests: testing/F139. Classification.
import assert from 'node:assert/strict';
import { find, runFx } from './lib.mjs';
export const id = 'testing/T364';
export const tests = ['testing/F139', 'testing/F142'];
export const title = 'only an assertion failure is RED; any other failure, a skip, a todo, a timeout and a cancellation are UNKNOWN, and nothing unfinished is GREEN';
export async function run() {
  const c = await runFx(['classes']);
  assert.equal(find(c, 'classes', 'asserts').actual, 'RED');
  assert.equal(find(c, 'classes', 'throws').actual, 'UNKNOWN', 'a thrown Error is not an assertion');
  assert.equal(find(c, 'classes', 'green').actual, 'GREEN');
  assert.deepEqual(c.counts, { GREEN: 1, RED: 1, UNKNOWN: 1 });

  const s = await runFx(['skiptodo']);
  for (const n of ['skipped', 'todo no body', 'todo passing', 'todo failing', 'skip option failing'])
    assert.equal(find(s, 'skiptodo', n)?.actual, 'UNKNOWN', `${n}: skip and todo come before pass or fail`);
  assert.equal(find(s, 'skiptodo', 'skipped').reason, 'skipped');
  assert.equal(find(s, 'skiptodo', 'todo failing').reason, 'todo');
  assert.deepEqual(s.counts, { GREEN: 1, RED: 0, UNKNOWN: 5 });

  const h = await runFx(['hang'], { timeoutMs: 1500 });
  assert.equal(h.execution.complete, false, 'a timeout makes the run incomplete');
  assert.ok(h.execution.problems.some((p) => p.kind === 'timeout' && p.file.endsWith('hang.fixture.mjs')), 'the timeout is an execution problem of the file');
  for (const n of ['hangs', 'pending one', 'pending two']) {
    const t = find(h, 'hang', n);
    assert.ok(!t || t.actual === 'UNKNOWN', `${n}: unfinished or cancelled, never GREEN`);
  }
  assert.equal(h.counts.RED, 0, 'a timeout never makes up a RED');
  assert.equal(find(h, 'hang', 'green').actual, 'GREEN', 'a test that finished before the timeout keeps its result');

  const x = await runFx(['cancel']);
  assert.equal(find(x, 'cancel', 'before').actual, 'GREEN');
  assert.equal(find(x, 'cancel', ['parent with pending children', 'stuck']).actual, 'UNKNOWN', 'a cancelled test is UNKNOWN');
  assert.equal(find(x, 'cancel', 'after').actual, 'UNKNOWN');
  for (const n of ['pending child one', 'pending child two']) {
    const t = find(x, 'cancel', ['parent with pending children', n]);
    assert.ok(!t || t.actual === 'UNKNOWN', );
  }
  assert.equal(x.counts.RED, 0);
  assert.equal(x.execution.complete, false, 'cancellation leaves tests unreported, so the run is incomplete');
  assert.ok(x.execution.problems.some((p) => p.kind === 'cancelled' && p.file.endsWith('cancel.fixture.mjs')));
}
