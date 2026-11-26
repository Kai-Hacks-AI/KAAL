// Case release/T1594 tests: release/C162. A record has an established run only when the supplied run data reports it; a record never establishes itself.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/evidence/collect-run-records.mjs');
export const id = 'release/T1594';
export const tests = ['release/C162'];
export const title = 'a record has an established run only when the supplied runs report it at the revision';
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
  assert.deepEqual(ok.established, [{ control: 'release/CTL1', run: '100', sha: REV }], 'a reported run establishes its record');
  const ghost = await collect(input({ runs: [run({ run: '200', lines: [line({ ...record, run: '999' })] })] }));
  assert.equal(ghost.records.length, 1, 'the record is collected');
  assert.ok(!ghost.established.some((e) => e.run === '999'), 'a record that names an unreported run is not established by its own claim');
}
