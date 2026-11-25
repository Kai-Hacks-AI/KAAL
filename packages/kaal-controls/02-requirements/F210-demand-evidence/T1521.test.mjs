// Case controls/T1521 tests: controls/F210
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
const ctl = (id, over = {}) => ({ id, status: 'designed', stations: [], path: `p/${id}.md`, mode: 'off', evidence: 'UNKNOWN', ...over });
const rec = (control, over = {}) => ({ control, x: 'real', run: 'r', sha: 's', verdict: 'PASS', by: 'adapter', ...over });
export const id = 'controls/T1521';
export const tests = ['controls/F210'];
export const title = 'demand Evidence names a control whose mode rose without the evidence for the new mode, and no other';
export async function run() {
  const { findEvidenceDue } = await load('demand-evidence.mjs');
  const f = (base, head, records = []) => findEvidenceDue({ base, head, records });
  const on = [ctl('c/CTL1', { mode: 'detective' })], off = [ctl('c/CTL1')];
  assert.deepEqual(f(off, on), ['evidence-due:c/CTL1'], 'a control switched on without a run was allowed');
  assert.deepEqual(f(off, on, [rec('c/CTL1', { x: 'fixture' })]), [], 'a run record did not satisfy the raise to detective');
  for (const bad of [rec('c/CTL1', { verdict: 'UNKNOWN' }), rec('c/CTL1', { by: '' }), rec('c/CTL2')]) assert.deepEqual(f(off, on, [bad]), ['evidence-due:c/CTL1'], 'a record that counts for nothing satisfied the raise');
  const pre = [ctl('c/CTL1', { mode: 'preventive' })];
  assert.deepEqual(f(on, pre, [rec('c/CTL1')]), ['evidence-due:c/CTL1'], 'preventive without tested evidence was allowed');
  assert.deepEqual(f(on, [ctl('c/CTL1', { mode: 'preventive', evidence: 'PASS' })], [rec('c/CTL1')]), []);
  assert.deepEqual(f(on, on), [], 'a mode that did not rise was asked');
  assert.deepEqual(f(pre, on), [], 'lowering a mode was asked');
  assert.deepEqual(f([], on), ['evidence-due:c/CTL1'], 'a control absent from the base was not taken as off');
  assert.throws(() => f(null, on), 'bad input did not throw');
}
