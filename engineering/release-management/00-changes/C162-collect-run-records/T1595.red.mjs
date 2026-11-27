// Case release/T1595 tests: release/C162. The answer is the shape the controls judge takes, no field is a verdict, an unreadable map stays unreadable, and the entry reads no file, API or environment.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/evidence/collect-run-records.mjs');
export const id = 'release/T1595';
export const tests = ['release/C162'];
export const title = 'the answer is the shape the controls judge takes, carries no verdict and keeps an unreadable map unreadable';
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
  const out = await collect(input());
  for (const k of ['revision', 'records', 'unbound', 'established', 'rejected', 'map', 'entries']) assert.ok(k in out, `the answer lacks ${k}`);
  assert.ok(!['verdict', 'implemented', 'running', 'tested'].some((k) => k in out), 'the collector states no fact or verdict');
  const unreadable = await collect(input({ map: null }));
  assert.equal(unreadable.map, null, 'an unreadable map stays unreadable, never empty');
  const src = readFileSync(ENTRY, 'utf8');
  for (const m of ['node:fs', 'node:child_process', 'node:http', 'fetch(', 'process.env']) assert.ok(!src.includes(m), `the entry uses ${m}`);
}
