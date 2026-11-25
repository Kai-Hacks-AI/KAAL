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
export const title = 'demand Evidence names a control whose mode rose without the facts the new mode needs, each fact on its own, and never accepts a missing proof';
export async function run() {
  const { findEvidenceDue } = await load('demand-evidence.mjs');
  const m = (mode) => [{ id: 'c/CTL1', mode }];
  const f = (base, head, facts) => findEvidenceDue({ base, head, facts });
  const D = ['evidence-due:c/CTL1'];
  assert.deepEqual(f(m('off'), m('detective'), { 'c/CTL1': { running: false, tested: false } }), D, 'a control switched on without a run was allowed');
  assert.deepEqual(f(m('off'), m('detective'), { 'c/CTL1': { running: true, tested: false } }), [], 'a run did not satisfy the raise to detective');
  assert.deepEqual(f(m('off'), m('detective'), { 'c/CTL1': { running: null, tested: true } }), D, 'tested was taken to imply running');
  assert.deepEqual(f(m('off'), m('detective'), {}), D, 'a missing proof let a raise pass');
  assert.deepEqual(f(m('detective'), m('preventive'), { 'c/CTL1': { running: true, tested: false } }), D, 'preventive without tested evidence was allowed');
  assert.deepEqual(f(m('detective'), m('preventive'), { 'c/CTL1': { running: false, tested: true } }), D, 'running was taken to be implied by tested');
  assert.deepEqual(f(m('detective'), m('preventive'), { 'c/CTL1': { running: true, tested: true } }), []);
  assert.deepEqual(f(m('detective'), m('detective'), {}), [], 'a mode that did not rise was asked');
  assert.deepEqual(f(m('preventive'), m('detective'), {}), [], 'lowering a mode was asked');
  assert.deepEqual(f([], m('detective'), {}), D, 'a control absent from the base was not taken as off');
  for (const bad of [[null, m('detective'), {}], [[], m('detective'), 'x'], [[], null, {}]]) assert.throws(() => f(...bad), 'bad input did not throw');
}
