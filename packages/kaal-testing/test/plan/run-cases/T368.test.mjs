// Case testing/T368 tests: testing/F144. The command line and the retained streams.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cli, fx, load, runFx, SCHEMA } from './lib.mjs';
export const id = 'testing/T368';
export const tests = ['testing/F144', 'testing/F145'];
export const title = 'kaal-testing run prints a schema-valid report and exits 0 whenever it has one, non-zero only for invalid input, and --streams keeps the reporter streams';
export async function run() {
  const r = cli(['run', fx('mixed')]);
  assert.equal(r.status, 0, 'a report with RED is still a report: exit 0');
  const rep = JSON.parse(r.stdout);
  assert.equal(rep.schema, SCHEMA);
  assert.deepEqual(rep.counts, { GREEN: 1, RED: 2, UNKNOWN: 0 });
  for (const k of ['counts', 'tests', 'diagnostics', 'execution']) assert.ok(k in rep, `the report has ${k}`);
  assert.equal(typeof rep.execution.complete, 'boolean');
  assert.ok(Array.isArray(rep.execution.problems));

  const bad = cli(['run', fx('loaderror'), fx('green')]);
  assert.equal(bad.status, 0, 'problems do not change the exit code');
  const br = JSON.parse(bad.stdout);
  assert.equal(br.execution.complete, false);
  assert.deepEqual(br.counts, { GREEN: 2, RED: 0, UNKNOWN: 0 });

  for (const args of [['run'], ['run', 'no/such/file.mjs'], ['frobnicate'], []]) {
    const x = cli(args);
    assert.notEqual(x.status, 0, `invalid input exits non-zero: ${args.join(' ')}`);
    assert.equal(x.stdout.trim(), '', 'and prints no report');
  }

  const stopped = cli(['run', '--timeout', '2000', fx('block')]);
  assert.equal(stopped.status, 0, 'a stopped file is a problem in a report, not a failure of the command');
  assert.ok(JSON.parse(stopped.stdout).execution.problems.some((p) => p.kind === 'timeout'));
  assert.equal(cli(['run', '--timeout', '0', fx('green')]).status !== 0, true, 'a bound that is not a positive number is invalid input');
  assert.ok(rep.execution.timeoutMs > 0, 'the default bound is reported');

  const dir = mkdtempSync(join(tmpdir(), 'kaal-streams-'));
  const s = cli(['run', '--streams', dir, fx('nested'), fx('parent')]);
  assert.equal(s.status, 0);
  const out = JSON.parse(s.stdout);
  const kept = readdirSync(dir);
  assert.equal(kept.length, 2, 'one reporter stream is kept per file');
  const { reconstruct } = await load();
  for (const f of [fx('nested'), fx('parent')]) {
    const name = kept.find((k) => k.includes(f.split('/').pop()));
    assert.ok(name && existsSync(join(dir, name)), `a stream for ${f}`);
    const events = readFileSync(join(dir, name), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
    assert.ok(events.length > 0);
    const again = reconstruct(events, f);
    assert.deepEqual(again.tests.map((t) => t.actual).sort(), out.tests.filter((t) => t.file === f).map((t) => t.actual).sort(), 'the retained stream alone reproduces the file’s results');
  }
  assert.deepEqual((await runFx(['nested'])).counts, { GREEN: 3, RED: 2, UNKNOWN: 0 });
}
