// Case release/T1594 tests: release/C162. Running is true only through a valid record whose run is established independently, and missing evidence is null, never false.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/evidence/collect-dirt-facts.mjs');
export const id = 'release/T1594';
export const tests = ['release/C162'];
export const title = 'Running is true for a valid established record at the revision and null, never false, for each other case';
export async function run() {
  assert.ok(existsSync(ENTRY), 'the entry collect-dirt-facts.mjs is absent');
  const { collect } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof collect, 'function', 'the entry exports no collect');
  const REV = 'a'.repeat(40);
  const control = { id: 'release/CTL1', claimed: { defined: true, implemented: true, running: true, tested: false } };
  const entry = { path: 'engineering/release-management/05-src/x/judge-x.mjs', integrates: true };
  const rec = (more = {}) => ({ control: 'release/CTL1', x: 'real', run: '100', sha: REV, verdict: 'pass', by: 'adapter', ...more });
  const facts = (more = {}) => ({ revision: REV, controls: [control], map: { 'release/CTL1': entry }, mapReadable: true, records: [], established: [], ...more });
  const of = async (f) => (await collect(f)).facts['release/CTL1'];
  assert.equal((await of(facts({ records: [rec()], established: [{ control: 'release/CTL1', run: '100', sha: REV }] }))).running, true, 'a valid established record is running');
  const nulls = {
    'no record': facts(),
    'a run that is not established': facts({ records: [rec()] }),
    'another revision': facts({ records: [rec({ sha: 'b'.repeat(40) })], established: [{ control: 'release/CTL1', run: '100', sha: 'b'.repeat(40) }] }),
    'a record not by the adapter': facts({ records: [rec({ by: 'hand' })], established: [{ control: 'release/CTL1', run: '100', sha: REV }] }),
    'a run in mode off': facts({ records: [rec({ mode: 'off' })], established: [{ control: 'release/CTL1', run: '100', sha: REV }] }),
  };
  for (const [why, f] of Object.entries(nulls)) assert.equal((await of(f)).running, null, `${why}: running is unknown, never false`);
}
