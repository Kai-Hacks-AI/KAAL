// Case controls/T1519 tests: controls/F208
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
const claim = (o = {}) => ({ defined: true, implemented: true, running: true, tested: true, ...o });
const facts = (o = {}) => ({ revision: 's', defined: true, implemented: true, running: true, tested: true, ...o });
export const id = 'controls/T1519';
export const tests = ['controls/F208'];
export const title = 'verify Record names each declared claim that lags or overclaims its own fact, keeps unknown distinct so that it can neither pass nor be baselined, and keeps confirmed discrepancies beside unknown';
export async function run() {
  const { assessRecord, findDisagreeing } = await load('verify-record.mjs');
  const a = (controls, fs, o = {}) => assessRecord({ controls, facts: fs, revision: 's', ...o });
  const f = (controls, fs, o = {}) => findDisagreeing({ controls, facts: fs, revision: 's', ...o });
  const c1 = { id: 'c/CTL1', claimed: claim({ running: false }) }, c2 = { id: 'c/CTL2', claimed: claim() };
  assert.deepEqual(f([c1, c2], { 'c/CTL1': facts(), 'c/CTL2': facts({ implemented: false }) }), ['implemented:overclaims:c/CTL2', 'running:lags:c/CTL1'], 'a lag or an overclaim was missed (implemented has no exemption), or an agreeing control was named');
  assert.deepEqual(f([{ id: 'c/CTL1', claimed: claim({ running: false, tested: true }) }], { 'c/CTL1': facts() }), ['running:lags:c/CTL1'], 'a passing tested settled a running that lags');
  assert.deepEqual(f([c2], { 'c/CTL2': facts() }), []);
  // unknown is distinct, never clean
  const unknownKinds = {
    null: facts({ implemented: null }), missing: facts({ implemented: undefined }), 'unverified (string)': facts({ implemented: 'yes' }),
    stale: facts({ revision: 'other' }), 'no revision': { defined: true, implemented: true, running: true, tested: true },
  };
  for (const [what, fs] of Object.entries(unknownKinds)) {
    assert.ok(a([c2], { 'c/CTL2': fs }).unknown.length > 0, `a ${what} fact was not reported unknown`);
    assert.deepEqual(a([c2], { 'c/CTL2': fs }).findings, [], `a ${what} fact became a finding`);
    assert.throws(() => f([c2], { 'c/CTL2': fs }), (e) => e.name === 'UnknownEvidence' && Array.isArray(e.unknown) && e.unknown.length > 0, `a ${what} fact gave a clean result`);
  }
  assert.deepEqual(a([c2], { 'c/CTL2': facts({ revision: 'other' }) }).unknown, ['defined:c/CTL2', 'implemented:c/CTL2', 'running:c/CTL2', 'tested:c/CTL2'], 'a stale entry did not make all four facts unknown');
  // a confirmed discrepancy is kept beside unknown
  const mixed = { 'c/CTL1': facts(), 'c/CTL2': facts({ tested: null, implemented: false }) };
  assert.deepEqual(a([c1, c2], mixed), { findings: ['implemented:overclaims:c/CTL2', 'running:lags:c/CTL1'], unknown: ['tested:c/CTL2'] }, 'a confirmed discrepancy was dropped beside unknown');
  assert.throws(() => f([c1, c2], mixed), (e) => e.name === 'UnknownEvidence' && JSON.stringify(e.confirmed) === JSON.stringify(['implemented:overclaims:c/CTL2', 'running:lags:c/CTL1']), 'the error did not keep the confirmed discrepancies');
  for (const bad of [{ controls: null }, { facts: 'x' }, { facts: {} }, { revision: '' }, { controls: [{ id: 'c/CTL1', claimed: { running: 'yes' } }] }]) assert.throws(() => f([c2], { 'c/CTL2': facts() }, bad), 'bad or incomplete input did not throw: ' + JSON.stringify(bad));
  // through the adapter: a confirmed finding can be baselined, unknown never passes even with an allowance
  const { runControl } = await load('adapter.mjs');
  const old = ['running:lags:c/CTL1'];
  const go = (fs, baseline = old) => runControl({ id: 'controls/CTL3', mode: 'ratchet', check: () => f([c1, c2], fs), input: {}, baseline, previous: baseline, boundary: { x: 'real', run: 'r', sha: 's' } });
  assert.equal((await go({ 'c/CTL1': facts(), 'c/CTL2': facts() })).verdict, 'PASS', 'a baselined confirmed discrepancy was not allowed');
  assert.equal((await go({ 'c/CTL1': facts(), 'c/CTL2': facts({ implemented: false }) })).verdict, 'FAIL', 'a new confirmed discrepancy passed the ratchet');
  for (const [what, fs] of Object.entries(unknownKinds)) {
    const r = await go({ 'c/CTL1': facts(), 'c/CTL2': fs }, ['running:lags:c/CTL1', 'unknown:c/CTL2', 'implemented:overclaims:c/CTL2']);
    assert.equal(r.verdict, 'UNKNOWN', `a ${what} fact passed or was filtered by an allowance`);
    assert.equal(r.blocked, true, `a ${what} fact did not fail closed`);
  }
}
