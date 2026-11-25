// Case controls/T1511 tests: controls/F204
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
export const id = 'controls/T1511';
export const tests = ['controls/F204'];
export const title = 'four independent facts are compared with their claims one by one, a missing proof is UNKNOWN, and execution is established for the control and revision alone';
const claim = (o = {}) => ({ defined: true, implemented: true, running: true, tested: true, ...o });
const facts = (o = {}) => ({ defined: true, implemented: true, running: true, tested: true, ...o });
const rec = (o = {}) => ({ control: 'c/CTL1', x: 'real', run: 'r1', sha: 'abc', verdict: 'PASS', by: 'adapter', ...o });
export async function run() {
  const { compareClaims, executed } = await load();
  const cmp = (c, f) => compareClaims({ id: 'c/CTL1', claimed: c, facts: f });
  assert.deepEqual(cmp(claim(), facts()), { id: 'c/CTL1', findings: [], unknown: [] });
  assert.deepEqual(cmp(claim({ running: false }), facts()).findings, ['running:lags'], 'a record that lags its fact was not found');
  assert.deepEqual(cmp(claim(), facts({ implemented: false })).findings, ['implemented:overclaims'], 'an overclaim was not found');
  assert.deepEqual(cmp(claim({ running: false, tested: false }), facts({ defined: false })).findings, ['defined:overclaims', 'running:lags', 'tested:lags'], 'findings are not sorted or not each alone');
  // independence: a passing tested never stands in for a running that lags, and vice versa
  assert.deepEqual(cmp(claim({ running: false, tested: true }), facts({ running: true, tested: true })).findings, ['running:lags']);
  assert.deepEqual(cmp(claim({ tested: false, running: true }), facts({ tested: true, running: false })).findings, ['running:overclaims', 'tested:lags'], 'one fact settled another');
  // missing proof is UNKNOWN, never a finding
  const u = cmp(claim(), { defined: true, implemented: null, running: undefined, tested: true });
  assert.deepEqual(u.findings, [], 'a missing proof was taken as absence');
  assert.deepEqual(u.unknown, ['implemented', 'running']);
  for (const bad of [[undefined, facts()], [claim(), undefined], [claim({ running: 'yes' }), facts()], [claim(), 'x']]) assert.throws(() => cmp(...bad), 'a malformed input was accepted');
  assert.throws(() => compareClaims({ claimed: claim(), facts: facts() }), 'a missing id was accepted');
  // execution evidence: the control and the applicable revision, real kind, not UNKNOWN, by the adapter
  const est = [{ control: 'c/CTL1', run: 'r1', sha: 'abc' }];
  const ex = (records, established = est, revision = 'abc') => executed({ id: 'c/CTL1', records, revision, established });
  assert.equal(ex([rec()]), true, 'an established, valid run of this control at this revision was not found');
  assert.equal(ex([rec({ verdict: 'FAIL' })]), true, 'an allowed FAIL verdict was refused');
  assert.equal(ex([]), null, 'no record was taken as proof of absence');
  assert.equal(ex([rec()], []), null, 'a committed record counted as proof of its own authenticity');
  assert.equal(ex([rec({ run: 'fabricated' })]), null, 'a fabricated record that is not established counted');
  assert.equal(ex([rec()], [{ control: 'c/CTL1', run: 'r1', sha: 'other' }]), null, 'evidence of another revision counted');
  assert.equal(ex([rec()], [{ control: 'c/CTL2', run: 'r1', sha: 'abc' }]), null, 'evidence of another control counted');
  for (const nothing of [rec({ run: '' }), rec({ run: undefined }), rec({ verdict: 'UNKNOWN' }), rec({ verdict: 'MAYBE' }), rec({ verdict: '' }), rec({ verdict: 42 }), rec({ verdict: undefined }), rec({ control: 'c/CTL2' }), rec({ by: '' }), rec({ x: 'fixture' }), rec({ sha: 'other' })]) assert.equal(ex([nothing]), null, 'a record that counts for nothing counted: ' + JSON.stringify(nothing));
  for (const bad of [{ established: 'x' }, { established: undefined }, { records: 'x' }]) assert.throws(() => executed({ id: 'c/CTL1', records: [rec()], revision: 'abc', established: est, ...bad }), 'bad input did not throw');
  assert.notEqual(ex([rec({ x: 'fixture' })]), false, 'executed never answers false');
}
