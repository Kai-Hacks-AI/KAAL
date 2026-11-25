// Case controls/T1514 tests: controls/F205
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
const ctl = (id, over = {}) => ({ id, status: 'designed', mode: 'off', evidence: 'UNKNOWN', ...over });
const rec = (control, over = {}) => ({ control, x: 'real', run: 'r', sha: 's', verdict: 'PASS', by: 'adapter', ...over });
export const id = 'controls/T1514';
export const tests = ['controls/F205'];
export const title = 'a pull request into a collector is told that the record of an installed control is due while it still claims designed';
export async function run() {
  const { judgeDue } = await load();
  const j = (head, installed) => judgeDue({ stage: 'collector', base: head, head, installed, records: [] });
  assert.deepEqual(j([ctl('c/CTL1'), ctl('c/CTL2', { status: 'implemented' }), ctl('c/CTL3')], ['c/CTL1', 'c/CTL2']), { verdict: 'REPORT', findings: ['record-due:c/CTL1'] });
  assert.deepEqual(j([ctl('c/CTL1', { status: 'running' })], ['c/CTL1']), { verdict: 'PASS', findings: [] }, 'an installed control that claims running was asked for a record');
  assert.deepEqual(j([ctl('c/CTL1')], []), { verdict: 'PASS', findings: [] }, 'a control that is not installed was asked for a record');
  for (const bad of [{ installed: 'x' }, { head: null }, { stage: 'other' }]) assert.equal(judgeDue({ stage: 'collector', base: [], head: [], installed: [], records: [], ...bad }).verdict, 'UNKNOWN', 'bad input was not UNKNOWN');
}
