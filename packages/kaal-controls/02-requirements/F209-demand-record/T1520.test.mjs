// Case controls/T1520 tests: controls/F209
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
const ctl = (id, over = {}) => ({ id, status: 'designed', stations: [], path: `p/${id}.md`, mode: 'off', evidence: 'UNKNOWN', ...over });
const rec = (control, over = {}) => ({ control, x: 'real', run: 'r', sha: 's', verdict: 'PASS', by: 'adapter', ...over });
export const id = 'controls/T1520';
export const tests = ['controls/F209'];
export const title = 'demand Record names an installed control whose record still claims designed, and no other';
export async function run() {
  const { findRecordDue } = await load('demand-record.mjs');
  const controls = [ctl('c/CTL1'), ctl('c/CTL2', { status: 'implemented' }), ctl('c/CTL3'), ctl('c/CTL4', { status: 'running' })];
  assert.deepEqual(findRecordDue({ controls, installed: ['c/CTL1', 'c/CTL2', 'c/CTL4'] }), ['record-due:c/CTL1'], 'an installed control that claims designed was missed, or another was named');
  assert.deepEqual(findRecordDue({ controls, installed: [] }), [], 'a control that is not installed was named');
  for (const bad of [{ controls: null }, { installed: 'x' }]) assert.throws(() => findRecordDue({ controls, installed: [], ...bad }), 'bad input did not throw');
}
