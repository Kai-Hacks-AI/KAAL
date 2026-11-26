// Case release/T1593 tests: release/C162. Implemented comes from the delivery map and the delivered entry, and a structural fact never implies Running.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/evidence/collect-dirt-facts.mjs');
export const id = 'release/T1593';
export const tests = ['release/C162'];
export const title = 'Implemented is true for a delivered adapter-integrated entry, false for an absent row, null for an unreadable map, and never implies Running';
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
  assert.equal((await of(facts())).implemented, true, 'a delivered integrated entry is implemented');
  assert.equal((await of(facts({ map: {} }))).implemented, false, 'a control with no map row is not implemented');
  assert.equal((await of(facts({ mapReadable: false }))).implemented, null, 'an unreadable map is unknown');
  assert.equal((await of(facts())).running, null, 'a structural fact leaves running unknown');
}
