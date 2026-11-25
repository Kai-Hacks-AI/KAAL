// Case controls/T1515 tests: controls/F205
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
const ctl = (id, over = {}) => ({ id, status: 'designed', mode: 'off', evidence: 'UNKNOWN', ...over });
const rec = (control, over = {}) => ({ control, x: 'real', run: 'r', sha: 's', verdict: 'PASS', by: 'adapter', ...over });
export const id = 'controls/T1515';
export const tests = ['controls/F205'];
export const title = 'a pull request that raises the mode of a control must carry the evidence for the new mode, and one that does not raise it is never asked';
export async function run() {
  const { judgeDue } = await load();
  const j = (base, head, records = []) => judgeDue({ stage: 'raise', base, head, installed: [], records });
  const on = [ctl('c/CTL1', { mode: 'detective' })];
  assert.deepEqual(j([ctl('c/CTL1')], on), { verdict: 'REPORT', findings: ['evidence-due:c/CTL1'] }, 'a control switched on without a run was allowed');
  assert.equal(j([ctl('c/CTL1')], on, [rec('c/CTL1', { x: 'fixture' })]).verdict, 'PASS', 'a run record did not satisfy the raise to detective');
  assert.equal(j([ctl('c/CTL1')], on, [rec('c/CTL1', { verdict: 'UNKNOWN' })]).verdict, 'REPORT', 'a run that could not judge satisfied the raise');
  assert.equal(j([ctl('c/CTL1')], on, [rec('c/CTL1', { by: '' })]).verdict, 'REPORT', 'an unrecorded run satisfied the raise');
  assert.equal(j([ctl('c/CTL1')], on, [rec('c/CTL2')]).verdict, 'REPORT', 'the run of another control satisfied the raise');
  const prev = [ctl('c/CTL1', { mode: 'detective' })], pre = [ctl('c/CTL1', { mode: 'preventive' })];
  assert.deepEqual(j(prev, pre, [rec('c/CTL1')]), { verdict: 'REPORT', findings: ['evidence-due:c/CTL1'] }, 'preventive without tested evidence was allowed');
  assert.equal(j(prev, [ctl('c/CTL1', { mode: 'preventive', evidence: 'PASS' })], [rec('c/CTL1')]).verdict, 'PASS');
  assert.equal(j(prev, prev).verdict, 'PASS', 'a control whose mode did not rise was asked');
  assert.equal(j(pre, prev).verdict, 'PASS', 'lowering a mode was asked for evidence');
  assert.deepEqual(j([], on).findings, ['evidence-due:c/CTL1'], 'a control absent from the base was not taken as off');
  assert.equal(j(null, on).verdict, 'UNKNOWN');
}
