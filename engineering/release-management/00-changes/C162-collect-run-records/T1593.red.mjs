// Case release/T1593 tests: release/C162. Records are collected as printed, tied to their run; malformed lines and runs of another revision are rejected with a reason.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/evidence/collect-run-records.mjs');
export const id = 'release/T1593';
export const tests = ['release/C162'];
export const title = 'valid record lines are collected as printed, malformed lines and other revisions are rejected with a reason, nothing is dropped silently';
export async function run() {
  assert.ok(existsSync(ENTRY), 'the entry collect-run-records.mjs is absent');
  const { collect } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof collect, 'function', 'the entry exports no collect');
  const REV = 'a'.repeat(40);
  const record = { control: 'release/CTL1', x: 'real', run: '100', sha: REV, verdict: 'pass', by: 'adapter' };
  const line = (r) => `kaal-control ${JSON.stringify(r)}`;
  const run = (more = {}) => ({ run: '100', sha: REV, workflow: 'verify-workflow-names.yml', event: 'push', conclusion: 'success', lines: [line(record)], ...more });
  const input = (more = {}) => ({ revision: REV, runs: [run()], map: { rows: [] }, entries: {}, ...more });
  const ok = await collect(input());
  assert.deepEqual(ok.records.map((r) => r.record), [record], 'a valid line is collected as printed');
  assert.equal(ok.records[0].run, '100', 'a record is tied to its run');
  const bad = await collect(input({ runs: [run({ lines: ['kaal-control {not json'] }), run({ run: '101', sha: 'b'.repeat(40) })] }));
  assert.equal(bad.records.length, 0, 'a malformed line and another revision are not collected');
  assert.equal(bad.rejected.length, 2, 'each is rejected, none dropped silently');
  assert.ok(bad.rejected.every((r) => typeof r.reason === 'string' && r.reason.length > 0), 'each carries its reason');
}
