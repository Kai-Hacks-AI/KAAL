// Case controls/T1519 tests: controls/F208
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
const ctl = (id, over = {}) => ({ id, status: 'designed', stations: [], path: `p/${id}.md`, mode: 'off', evidence: 'UNKNOWN', ...over });
const rec = (control, over = {}) => ({ control, x: 'real', run: 'r', sha: 's', verdict: 'PASS', by: 'adapter', ...over });
export const id = 'controls/T1519';
export const tests = ['controls/F208'];
export const title = 'verify Record names a control whose record lags its evidence and one that overclaims it, whichever way it is wrong';
export async function run() {
  const { findDisagreeing } = await load('verify-record.mjs');
  const controls = [ctl('c/CTL1'), ctl('c/CTL2', { status: 'running' }), ctl('c/CTL3', { status: 'running' }), ctl('c/CTL4', { status: 'implemented' }), ctl('c/CTL5', { status: 'designed', evidence: 'PASS' })];
  const records = [rec('c/CTL1'), rec('c/CTL3'), rec('c/CTL5'), rec('c/CTL4', { verdict: 'UNKNOWN' })];
  assert.deepEqual(findDisagreeing({ controls, records }), ['overclaims:c/CTL2', 'record-lags:c/CTL1', 'record-lags:c/CTL5'], 'a lag or an overclaim was missed, or an agreeing control was named');
  assert.deepEqual(findDisagreeing({ controls: [ctl('c/CTL1', { status: 'running' })], records: [rec('c/CTL1')] }), []);
  assert.deepEqual(findDisagreeing({ controls: [ctl('c/CTL1')], records: [] }), [], 'a designed control with no run was named');
  for (const bad of [{ controls: null }, { records: 'x' }]) assert.throws(() => findDisagreeing({ controls, records, ...bad }), 'bad input did not throw');
}
