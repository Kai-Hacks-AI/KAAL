// Case testing/T364 tests: testing/F139. Classification.
import assert from 'node:assert/strict';
import { closeSync, mkdtempSync, openSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cli, find, fx, runFx } from './lib.mjs';
export const id = 'testing/T364';
export const tests = ['testing/F139', 'testing/F142', 'testing/F145'];
export const title = 'only an assertion failure is RED; any other failure, a skip, a todo and a cancellation are UNKNOWN; a file that does not end within the bound is stopped, reported as a timeout problem, and nothing unfinished is GREEN';
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

  const x = await runFx(['cancel']);
  assert.equal(find(x, 'cancel', 'before').actual, 'GREEN');
  assert.equal(find(x, 'cancel', ['parent with pending children', 'stuck']).actual, 'UNKNOWN', 'a cancelled test is UNKNOWN');
  // Node 22 cancels the later sibling too, Node 24 runs it (observed: streams/node-24.22.3-cancel.ndjson). Either is honest; a RED would not be.
  assert.ok(['GREEN', 'UNKNOWN'].includes(find(x, 'cancel', 'after').actual), 'a later sibling is GREEN if it ran, UNKNOWN if it was cancelled');
  for (const n of ['pending child one', 'pending child two']) {
    const t = find(x, 'cancel', ['parent with pending children', n]);
    assert.ok(!t || t.actual === 'UNKNOWN', );
  }
  assert.equal(x.counts.RED, 0);
  assert.equal(x.execution.complete, false, 'cancellation leaves tests unreported, so the run is incomplete');
  assert.ok(x.execution.problems.some((p) => p.kind === 'cancelled' && p.file.endsWith('cancel.fixture.mjs')));

  // The runner is started as a child with its own limit, so that a runner that does not bound its files fails here instead of hanging the Case.
  const t0 = Date.now();
  const out = join(mkdtempSync(join(tmpdir(), 'kaal-block-')), 'report.json');
  const fd = openSync(out, 'w');
  const proc = cli(['run', '--timeout', '2000', fx('block'), fx('green')], { timeout: 60000, stdio: ['ignore', fd, 'ignore'] });
  closeSync(fd);
  assert.ok(proc.status === 0 && Date.now() - t0 < 60000, 'a test that blocks the event loop cannot hold the run: the whole file is stopped from outside');
  const b = JSON.parse(readFileSync(out, 'utf8'));
  assert.equal(b.execution.complete, false);
  assert.ok(b.execution.problems.some((p) => p.kind === 'timeout' && p.file.endsWith('block.fixture.mjs')), 'the stopped file is a timeout problem');
  assert.equal(b.execution.problems.length, 1, 'only the blocked file is a problem');
  for (const n of ['blocks the event loop', 'after block']) assert.ok(!['GREEN', 'RED'].includes(find(b, 'block', n)?.actual), `${n}: never GREEN, never RED`);
  assert.equal(b.counts.RED, 0);
  assert.equal(b.tests.filter((t) => t.file.endsWith('green.fixture.mjs') && t.actual === 'GREEN').length, 2, 'the other file is unaffected');
  const started = Date.now();
  const h = await runFx(['hang'], { timeoutMs: 1500 });
  assert.ok(Date.now() - started < 30000, 'the run is bounded: a file that never ends is stopped');
  assert.equal(h.execution.complete, false, 'a timeout makes the run incomplete');
  assert.ok(h.execution.problems.some((p) => p.kind === 'timeout' && p.file.endsWith('hang.fixture.mjs')), 'the timeout is an execution problem of the file');
  for (const n of ['hangs', 'pending one', 'pending two']) {
    const t = find(h, 'hang', n);
    assert.ok(!t || t.actual === 'UNKNOWN', `${n}: unfinished or cancelled, never GREEN`);
  }
  assert.equal(h.counts.RED, 0, 'a timeout never makes up a RED');
  assert.equal(find(h, 'hang', 'green').actual, 'GREEN', 'a test that finished before the timeout keeps its result');

  assert.equal(b.execution.timeoutMs, 2000, 'the report records the bound it ran under');
  assert.ok(Number.isInteger((await runFx(['green'])).execution.timeoutMs) && (await runFx(['green'])).execution.timeoutMs > 0, 'there is a default bound, so no run is unbounded');
}
