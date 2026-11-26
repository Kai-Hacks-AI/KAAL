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
  const run = (more = {}) => ({ run: '100', sha: REV, workflow: '.github/workflows/verify-workflow-names.yml', event: 'push', conclusion: 'success', lines: [line(record)], ...more });
  const MAP = { rows: [{ control: 'release/CTL1', delivered: '.github/workflows/verify-workflow-names.yml', entry: 'e/1.mjs' }, { control: 'release/CTL2', delivered: '.github/workflows/other.yml', entry: 'e/2.mjs' }] };
  const input = (more = {}) => ({ revision: REV, runs: [run()], map: MAP, entries: {}, ...more });
  const ok = await collect(input());
  assert.deepEqual(ok.established, [{ control: 'release/CTL1', run: '100', sha: REV }], 'a run of the workflow a row delivers establishes that row control');
  const none = (out) => assert.equal(out.established.length, 0, 'nothing is established');
  const has = (out, control, runId) => out.established.some((e) => e.control === control && e.run === runId);
  const ghost = await collect(input({ runs: [run({ run: '200', lines: [line({ ...record, run: '999' })] })] }));
  assert.equal(ghost.records.length, 1, 'the record is collected');
  assert.ok(!has(ghost, 'release/CTL1', '999'), 'a record that names an unreported run is not established by its own claim');
  // a record that claims another existing run: run 300 exists and belongs to the workflow that delivers CTL2
  const other = await collect(input({ runs: [run(), run({ run: '300', workflow: '.github/workflows/other.yml', lines: [] })] }));
  assert.ok(has(other, 'release/CTL2', '300'), 'the run of the other workflow establishes its own control');
  assert.ok(!has(other, 'release/CTL1', '300'), 'a run of another control workflow does not establish this control');
  const claims = await collect(input({ runs: [run({ run: '300', workflow: '.github/workflows/other.yml', lines: [line({ ...record, run: '300' })] })] }));
  assert.ok(!has(claims, 'release/CTL1', '300'), 'a control that the emitting workflow does not deliver is not established, whatever the record claims');
  none(await collect(input({ runs: [run({ sha: 'b'.repeat(40) })] })));
  none(await collect(input({ map: null })));
}
