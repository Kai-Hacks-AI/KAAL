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
  assert.equal(ghost.records.length, 0, 'a record that claims a run other than its emitter is not evidence');
  assert.equal(ghost.unbound.length, 1, 'it is kept raw as unbound');
  assert.deepEqual(ghost.unbound[0].record, { ...record, run: '999' }, 'the raw record is preserved as printed');
  assert.ok(typeof ghost.unbound[0].reason === 'string' && ghost.unbound[0].reason.length > 0, 'the reason is preserved');
  assert.ok(!has(ghost, 'release/CTL1', '999'), 'a record that names an unreported run is not established by its own claim');
  // run 200 prints a record claiming run 100: 100 is a real run of the same authorized workflow at the same revision and is established independently
  const sibling = await collect(input({ runs: [run(), run({ run: '200', lines: [line(record)] })] }));
  assert.ok(has(sibling, 'release/CTL1', '100'), 'run 100 is established independently');
  assert.deepEqual(sibling.records.map((r) => r.run), ['100'], 'only the record bound to its emitting run is evidence');
  assert.equal(sibling.unbound.length, 1, 'the record that run 200 printed for run 100 is unbound');
  assert.equal(sibling.unbound[0].emitter.run, '200', 'the unbound record names its actual emitter');
  assert.deepEqual(sibling.unbound[0].record, record, 'the raw record is preserved as printed');
  assert.ok(sibling.unbound[0].reason.length > 0, 'the reason is preserved');
  // the same for a record that claims another revision than its emitting run
  const resha = await collect(input({ runs: [run({ lines: [line({ ...record, sha: 'c'.repeat(40) })] })] }));
  assert.equal(resha.records.length, 0, 'a record claiming another sha than its emitter is not evidence');
  assert.equal(resha.unbound.length, 1, 'it is kept as unbound');
  // a record that claims another existing run: run 300 exists and belongs to the workflow that delivers CTL2
  const other = await collect(input({ runs: [run(), run({ run: '300', workflow: '.github/workflows/other.yml', lines: [] })] }));
  assert.ok(has(other, 'release/CTL2', '300'), 'the run of the other workflow establishes its own control');
  assert.ok(!has(other, 'release/CTL1', '300'), 'a run of another control workflow does not establish this control');
  const claims = await collect(input({ runs: [run({ run: '300', workflow: '.github/workflows/other.yml', lines: [line({ ...record, run: '300' })] })] }));
  assert.ok(!has(claims, 'release/CTL1', '300'), 'a control that the emitting workflow does not deliver is not established, whatever the record claims');
  assert.equal(claims.records.length, 1, 'a record bound to its emitter stays collected though its control is not authorized');
  none(await collect(input({ runs: [run({ sha: 'b'.repeat(40) })] })));
  none(await collect(input({ map: null })));
}
