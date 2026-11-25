// Case controls/T1521 tests: controls/F210
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1521';
export const tests = ['controls/F210'];
export const title = 'demand Evidence names each fact and the authorization that a proposed activation or enforcement transition lacks, with no mode ladder, each fact on its own proof, and a missing proof never accepted';
export async function run() {
  const { findEvidenceDue } = await load('demand-evidence.mjs');
  const all = { defined: true, implemented: true, running: true, tested: true };
  const t = (kind, authorized = true) => [{ control: 'c/CTL1', kind, authorized }];
  const f = (tr, facts) => findEvidenceDue({ transitions: tr, facts });
  assert.deepEqual(f(t('activation'), { 'c/CTL1': { ...all, running: null } }), [], 'running, which only exists after a WIRE, was demanded before it');
  assert.deepEqual(f(t('activation'), { 'c/CTL1': { ...all, implemented: false, tested: null } }), ['evidence-due:activation:implemented:c/CTL1', 'evidence-due:activation:tested:c/CTL1'], 'a prerequisite before the WIRE was accepted without proof, or one finding did not name its fact');
  assert.deepEqual(f(t('enforcement'), { 'c/CTL1': { ...all, running: false } }), ['evidence-due:enforcement:running:c/CTL1'], 'enforcement without a run was allowed');
  assert.deepEqual(f(t('enforcement'), { 'c/CTL1': { ...all, tested: false, running: true } }), ['evidence-due:enforcement:tested:c/CTL1'], 'running was taken to imply tested');
  assert.deepEqual(f(t('enforcement'), { 'c/CTL1': { ...all, running: false, tested: true } }), ['evidence-due:enforcement:running:c/CTL1'], 'tested was taken to imply running');
  assert.deepEqual(f(t('enforcement', false), { 'c/CTL1': all }), ['evidence-due:enforcement:authorized:c/CTL1'], 'a transition without the Owner authorization passed');
  assert.deepEqual(f(t('enforcement'), { 'c/CTL1': all }), []);
  assert.deepEqual(f(t('activation'), {}), ['evidence-due:activation:defined:c/CTL1', 'evidence-due:activation:implemented:c/CTL1', 'evidence-due:activation:tested:c/CTL1'], 'a missing proof let a transition pass');
  assert.deepEqual(f([], {}), [], 'a control with no transition was asked');
  for (const bad of [[null, {}], [t('detective'), {}], [t('activation'), 'x'], [[{ control: 'c/CTL1', kind: 'activation' }], {}]]) assert.throws(() => f(...bad), 'bad input did not throw');
}
