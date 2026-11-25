// Case controls/T1520 tests: controls/F209
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
const ctl = (id, o = {}) => ({ id, claimed: { defined: true, implemented: false, running: false, tested: false, ...o } });
export const id = 'controls/T1520';
export const tests = ['controls/F209'];
export const title = 'demand Record names a control observed installed whose record does not claim implemented, from the observation of the delivery and not from a list, and never from a missing observation';
export async function run() {
  const { findRecordDue } = await load('demand-record.mjs');
  const ob = (control, installed, revision = 's') => ({ control, revision, installed });
  const controls = [ctl('c/CTL1'), ctl('c/CTL2', { implemented: true }), ctl('c/CTL3'), ctl('c/CTL4', { implemented: false, running: true })];
  const due = (observed, o = {}) => findRecordDue({ controls, observed, revision: 's', ...o });
  assert.deepEqual(due([ob('c/CTL1', true), ob('c/CTL2', true), ob('c/CTL3', false), ob('c/CTL4', true)]), ['record-due:c/CTL1', 'record-due:c/CTL4'], 'an installed control whose record does not claim implemented was missed, or another was named; running was taken to imply implemented');
  assert.deepEqual(due([ob('c/CTL1', false), ob('c/CTL2', false), ob('c/CTL3', false), ob('c/CTL4', false)]), [], 'a control that is not installed was named');
  assert.throws(() => due([ob('c/CTL1', true), ob('c/CTL2', true), ob('c/CTL3', false)]), 'a missing observation gave a result');
  assert.throws(() => due([ob('c/CTL1', true, 'other'), ob('c/CTL2', true), ob('c/CTL3', false), ob('c/CTL4', true)]), 'an observation of another revision counted');
  for (const bad of [{ controls: null }, { observed: 'x' }, { revision: '' }]) assert.throws(() => due([], bad), 'bad input did not throw');
}
