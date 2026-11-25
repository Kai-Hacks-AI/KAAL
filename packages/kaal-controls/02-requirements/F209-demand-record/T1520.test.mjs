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
export const title = 'demand Record decides when a correction is due from the discrepancies of verify Record and the observed installation, and treats a fact that cannot exist before a WIRE as not yet due';
export async function run() {
  const { findRecordDue } = await load('demand-record.mjs');
  const ob = (control, installed, revision = 's') => ({ control, revision, installed });
  const due = (discrepancies, observed, o = {}) => findRecordDue({ discrepancies, observed, revision: 's', ...o });
  const installed = [ob('c/CTL1', true), ob('c/CTL2', false)];
  assert.deepEqual(due(['running:lags:c/CTL1', 'tested:overclaims:c/CTL1'], installed), ['record-due:running:c/CTL1', 'record-due:tested:c/CTL1'], 'a post-WIRE discrepancy of an installed control was not made due');
  assert.deepEqual(due(['running:lags:c/CTL2', 'tested:lags:c/CTL2'], installed), [], 'a fact that cannot exist before a WIRE was taken as a false claim for a control not installed');
  assert.deepEqual(due(['defined:overclaims:c/CTL1', 'implemented:lags:c/CTL1'], installed), [], 'a pre-WIRE discrepancy was made due here instead of being left to verify Record');
  assert.deepEqual(due([], installed), []);
  assert.throws(() => due(['running:lags:c/CTL3'], installed), 'a control with no observation gave a result');
  assert.throws(() => due(['running:lags:c/CTL1'], [ob('c/CTL1', true, 'other')]), 'an observation of another revision counted');
  for (const bad of ['running-c/CTL1', 'running:maybe:c/CTL1', 'speed:lags:c/CTL1', 7]) assert.throws(() => due([bad], installed), 'a malformed discrepancy gave a result: ' + bad);
  for (const bad of [{ discrepancies: null }, { observed: 'x' }, { revision: '' }]) assert.throws(() => findRecordDue({ discrepancies: [], observed: installed, revision: 's', ...bad }), 'bad input did not throw');
}
