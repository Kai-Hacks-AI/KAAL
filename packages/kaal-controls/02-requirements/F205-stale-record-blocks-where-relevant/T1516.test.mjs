// Case controls/T1516 tests: controls/F205
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
const ctl = (id, over = {}) => ({ id, status: 'designed', mode: 'off', evidence: 'UNKNOWN', ...over });
const rec = (control, over = {}) => ({ control, x: 'real', run: 'r', sha: 's', verdict: 'PASS', by: 'adapter', ...over });
export const id = 'controls/T1516';
export const tests = ['controls/F205'];
export const title = 'a promotion into main is blocked by any record that lags or overclaims its evidence';
export async function run() {
  const { judgeDue } = await load();
  const j = (head, records) => judgeDue({ stage: 'promotion', base: head, head, installed: [], records });
  assert.deepEqual(j([ctl('c/CTL1'), ctl('c/CTL2', { status: 'running' }), ctl('c/CTL3', { status: 'running' })], [rec('c/CTL1'), rec('c/CTL3')]), { verdict: 'REPORT', findings: ['overclaims:c/CTL2', 'record-lags:c/CTL1'] });
  assert.deepEqual(j([ctl('c/CTL1', { status: 'running' })], [rec('c/CTL1')]), { verdict: 'PASS', findings: [] });
  assert.equal(j([ctl('c/CTL1')], []).verdict, 'PASS', 'a designed control with no run was reported');
}
