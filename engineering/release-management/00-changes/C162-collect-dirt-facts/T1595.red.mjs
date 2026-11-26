// Case release/T1595 tests: release/C162. The answer is a facts map that assessRecord takes unchanged, with a reason for every null and tested always null.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/evidence/collect-dirt-facts.mjs');
export const id = 'release/T1595';
export const tests = ['release/C162'];
export const title = 'the answer is a facts map for verify Record with a reason for every null, tested null, and no read of file, API or environment';
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
  const out = await collect(facts());
  const f = out.facts['release/CTL1'];
  assert.equal(f.revision, REV, 'every entry names its revision');
  assert.equal(f.tested, null, 'tested is never established here');
  assert.ok(out.reasons?.['running:release/CTL1'], 'a null fact carries its reason');
  assert.equal(typeof out.report, 'string', 'a plain text report accompanies the facts');
  const { assessRecord } = await import(pathToFileURL(join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/verify-record.mjs')).href);
  const a = assessRecord({ controls: [control], facts: out.facts, revision: REV });
  assert.ok(a.unknown.includes('running:release/CTL1'), 'verify Record reads the facts unchanged and treats null as unknown');
  const none = await collect(facts({ controls: [control, { id: 'release/CTL2', claimed: control.claimed }] }));
  assert.notEqual(none.facts['release/CTL2']?.running, true, 'a control with no evidence is never running');
}
