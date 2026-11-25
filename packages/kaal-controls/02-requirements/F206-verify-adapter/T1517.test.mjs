// Case controls/T1517 tests: controls/F206
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
const ctl = (id, over = {}) => ({ id, status: 'designed', stations: [], path: `p/${id}.md`, mode: 'off', evidence: 'UNKNOWN', ...over });
const rec = (control, over = {}) => ({ control, x: 'real', run: 'r', sha: 's', verdict: 'PASS', by: 'adapter', ...over });
export const id = 'controls/T1517';
export const tests = ['controls/F206'];
export const title = 'verify Adapter names a control with a station, or delivered, observed not to run through the adapter, or not observed at all, and runs as a ratchet over the controls that exist';
export async function run() {
  const { findUnadapted } = await load('verify-adapter.mjs');
  const controls = [ctl('c/CTL1', { stations: ['S:preventive'] }), ctl('c/CTL2', { stations: ['S:detective'] }), ctl('c/CTL3'), ctl('c/CTL4')];
  const ob = (control, adapted, revision = 's') => ({ control, revision, adapted });
  const find = (o) => findUnadapted({ controls, delivered: ['c/CTL4'], observed: [], revision: 's', ...o });
  assert.deepEqual(find({ observed: [ob('c/CTL1', false), ob('c/CTL2', true), ob('c/CTL4', false)] }), ['unadapted:c/CTL1', 'unadapted:c/CTL4'], 'a control observed not to run through the adapter was missed, or one that is adapted or has neither station nor delivery was named');
  assert.deepEqual(find({ observed: [ob('c/CTL1', true), ob('c/CTL2', true), ob('c/CTL4', true)] }), [], 'a fully observed clean set was named');
  assert.deepEqual(find({ observed: [ob('c/CTL2', true)] }), ['unobserved:c/CTL1', 'unobserved:c/CTL4'], 'incomplete evidence gave a clean verdict');
  assert.deepEqual(find({ observed: [ob('c/CTL1', true, 'other'), ob('c/CTL2', true), ob('c/CTL4', true)] }), ['unobserved:c/CTL1'], 'an observation of another revision counted');
  assert.deepEqual(find({ controls: controls.map((c) => ({ ...c, adapted: true })), observed: [] }).length, 3, 'a declaration claiming to be adapted was taken as proof');
  for (const bad of [{ controls: null }, { delivered: 'x' }, { observed: undefined }, { revision: '' }]) assert.throws(() => find(bad), 'bad input did not throw');
  const { runControl } = await load('adapter.mjs');
  const old = ['unadapted:c/CTL1', 'unadapted:c/CTL2'];
  const go = (cs) => runControl({ id: 'controls/CTL1', mode: 'ratchet', check: () => findUnadapted({ controls: cs, delivered: [], observed: cs.map((c) => ob(c.id, false)), revision: 's' }), input: {}, baseline: old, previous: old, boundary: { x: 'real', run: 'r', sha: 's' } });
  const stations = { stations: ['S:preventive'] };
  assert.equal((await go([ctl('c/CTL1', stations), ctl('c/CTL2', stations)])).verdict, 'PASS', 'the controls that exist today were not allowed');
  assert.equal((await go([ctl('c/CTL1', stations), ctl('c/CTL2', stations), ctl('c/CTL3', stations)])).verdict, 'FAIL', 'a new unadapted control passed the ratchet');
}
