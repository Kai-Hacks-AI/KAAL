// Case controls/T1520 tests: controls/F209
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1520';
export const tests = ['controls/F209'];
export const title = 'demand Record decides when a correction is due on the owning capability\'s next applicable pull request, relative to installation and evidence, never defers an overclaim, and never turns unknown into clean';
const tm = (v, o = {}) => ['c/CTL1', 'c/CTL2', 'c/CTL3'].flatMap((control) => ['defined', 'implemented', 'running', 'tested'].map((fact) => ({ control, fact, revision: 's', followsEvidence: v, ...o })));
const obs = (control, o = {}) => ({ control, revision: 's', installed: true, operationalEvidence: true, testing: 'operational', ...o });
export async function run() {
  const { findRecordDue } = await load('demand-record.mjs');
  const owners = { 'c/CTL1': 'controls', 'c/CTL2': 'controls', 'c/CTL3': 'release' };
  const due = (discrepancies, o = {}) => findRecordDue({ discrepancies, unknown: [], owners, pr: { capability: 'controls' }, timing: tm(true), observed: [obs('c/CTL1'), obs('c/CTL2'), obs('c/CTL3')], revision: 's', ...o });
  assert.deepEqual(due(['running:lags:c/CTL1', 'tested:overclaims:c/CTL2']), ['record-due:running:lags:c/CTL1', 'record-due:tested:overclaims:c/CTL2'], 'a discrepancy on the owner\'s applicable pull request was not made due');
  // timing relative to installation and evidence, not installation alone
  const early = { timing: tm(false) };
  assert.deepEqual(due(['running:lags:c/CTL1'], early), [], 'an early pull request, before the evidence, made a post-WIRE lag due');
  assert.deepEqual(due(['running:lags:c/CTL1'], { observed: [obs('c/CTL1', { operationalEvidence: false }), obs('c/CTL2'), obs('c/CTL3')] }), [], 'installation alone made a post-WIRE lag due');
  assert.deepEqual(due(['running:lags:c/CTL1'], { observed: [obs('c/CTL1', { installed: false }), obs('c/CTL2'), obs('c/CTL3')] }), [], 'a lag of a control not installed was due');
  assert.deepEqual(due(['tested:lags:c/CTL1'], { observed: [obs('c/CTL1', { installed: false, operationalEvidence: false, testing: 'pre' }), obs('c/CTL2'), obs('c/CTL3')] }), ['record-due:tested:lags:c/CTL1'], 'pre-WIRE testing was deferred as if it were operational');
  assert.deepEqual(due(['tested:lags:c/CTL1'], { observed: [obs('c/CTL1', { installed: false, operationalEvidence: false }), obs('c/CTL2'), obs('c/CTL3')] }), [], 'operational testing was due before installation');
  assert.deepEqual(due(['defined:lags:c/CTL1', 'implemented:overclaims:c/CTL2'], { ...early, observed: [obs('c/CTL1', { installed: false }), obs('c/CTL2', { installed: false }), obs('c/CTL3')] }), ['record-due:defined:lags:c/CTL1', 'record-due:implemented:overclaims:c/CTL2'], 'a pre-WIRE discrepancy was deferred');
  assert.deepEqual(due(['running:overclaims:c/CTL1'], { ...early, observed: [obs('c/CTL1', { installed: false, operationalEvidence: false }), obs('c/CTL2'), obs('c/CTL3')] }), ['record-due:running:overclaims:c/CTL1'], 'a genuine overclaim was deferred because the control is not installed');
  // mixed: two controls (and two facts) on the same owning pull request acquire their evidence at different times
  const mixedTiming = tm(true).map((x) => (x.control === 'c/CTL2' ? { ...x, followsEvidence: false } : x));
  assert.deepEqual(due(['running:lags:c/CTL1', 'running:lags:c/CTL2'], { timing: mixedTiming }), ['record-due:running:lags:c/CTL1'], 'one control that follows its evidence and one that does not were not told apart on the same pull request');
  const mixedFacts = tm(true).map((x) => (x.control === 'c/CTL1' && x.fact === 'tested' ? { ...x, followsEvidence: false } : x));
  assert.deepEqual(due(['running:lags:c/CTL1', 'tested:lags:c/CTL1'], { timing: mixedFacts }), ['record-due:running:lags:c/CTL1'], 'one fact that follows its evidence and one that does not were not told apart for the same control');
  // an unrelated capability's pull request
  assert.deepEqual(due(['running:lags:c/CTL3'], {}), [], 'an unrelated pull request made a correction due');
  assert.deepEqual(due(['running:lags:c/CTL3'], { pr: { capability: 'release' } }), ['record-due:running:lags:c/CTL3'], 'the owner\'s pull request was not applicable');
  // unknown is never clean
  for (const [what, o] of Object.entries({
    'unknown evidence for an owned control': { unknown: ['running:c/CTL1'] },
    'no timing entry for the fact': { timing: tm(true).filter((x) => !(x.control === 'c/CTL1' && x.fact === 'running')) },
    'timing of another revision': { timing: tm(true, { revision: 'other' }) },
    'timing not a boolean': { timing: tm('yes') },
    'no timing': { timing: undefined },
    'no owner': { owners: {} },
    'no observation': { observed: [obs('c/CTL2'), obs('c/CTL3')] },
    'observation of another revision': { observed: [obs('c/CTL1', { revision: 'other' }), obs('c/CTL2'), obs('c/CTL3')] },
    'no revision': { revision: '' },
  })) assert.throws(() => due(['running:lags:c/CTL1'], o), `${what} gave a result`);
  assert.deepEqual(due(['running:lags:c/CTL3'], { unknown: ['running:c/CTL3'] }), [], 'unknown evidence of a control another capability owns was asked of this pull request');
  // ownership is established before an unrelated control is excluded
  for (const [what, u] of Object.entries({ 'a control with no owner': ['running:c/CTL9'], 'a name with an unknown fact': ['speed:c/CTL3'], 'a name with no control': ['running'], 'a name that is not text': [7] })) assert.throws(() => due(['running:lags:c/CTL3'], { unknown: u }), `unknown evidence of ${what} was ignored`);
  for (const bad of ['running-c/CTL1', 'running:maybe:c/CTL1', 'speed:lags:c/CTL1', 7]) assert.throws(() => due([bad]), 'a malformed discrepancy gave a result: ' + bad);
  // through the adapter: a confirmed due can be baselined, unknown never passes
  const { runControl } = await load('adapter.mjs');
  const old = ['record-due:running:lags:c/CTL1'];
  const go = (o) => runControl({ id: 'controls/CTL4', mode: 'ratchet', check: () => due(['running:lags:c/CTL1'], o), input: {}, baseline: old, previous: old, boundary: { x: 'real', run: 'r', sha: 's' } });
  assert.equal((await go({})).verdict, 'PASS', 'a baselined due was not allowed');
  const r = await go({ unknown: ['running:c/CTL1'] });
  assert.equal(r.verdict, 'UNKNOWN', 'unknown evidence passed or was filtered by an allowance');
  assert.equal(r.blocked, true);
}
