// Case controls/T1517 tests: controls/F206
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
const ctl = (id, over = {}) => ({ id, status: 'designed', stations: [], path: `p/${id}.md`, mode: 'off', evidence: 'UNKNOWN', ...over });
export const id = 'controls/T1517';
export const tests = ['controls/F206'];
export const title = 'verify Adapter names a control confirmed not to run through the adapter, and an unknown observation can neither pass nor be baselined';
export async function run() {
  const { findUnadapted } = await load('verify-adapter.mjs');
  const controls = [ctl('c/CTL1', { stations: ['S:preventive'] }), ctl('c/CTL2', { stations: ['S:detective'] }), ctl('c/CTL3'), ctl('c/CTL4')];
  const ob = (control, adapted, revision = 's') => ({ control, revision, adapted });
  const find = (observed, o = {}) => findUnadapted({ controls, delivered: ['c/CTL4'], observed, revision: 's', ...o });
  assert.deepEqual(find([ob('c/CTL1', false), ob('c/CTL2', true), ob('c/CTL4', false)]), ['unadapted:c/CTL1', 'unadapted:c/CTL4'], 'a control confirmed not adapted was missed, or one that is adapted or has neither station nor delivery was named');
  assert.deepEqual(find([ob('c/CTL1', true), ob('c/CTL2', true), ob('c/CTL4', true)]), [], 'a fully observed clean set was named');
  assert.deepEqual(find([ob('c/CTL1', true), ob('c/CTL2', true), ob('c/CTL3', false), ob('c/CTL4', true)]), [], 'a control with neither station nor delivery was judged');
  const whole = [ob('c/CTL1', true), ob('c/CTL2', true), ob('c/CTL4', true)];
  const unknowns = {
    missing: whole.slice(1),
    stale: [ob('c/CTL1', true, 'other'), ...whole.slice(1)],
    'not a boolean': [ob('c/CTL1', 'yes'), ...whole.slice(1)],
    'no control': [{ revision: 's', adapted: true }, ...whole.slice(1)],
    contradictory: [ob('c/CTL1', true), ob('c/CTL1', false), ...whole.slice(1)],
  };
  for (const [what, observed] of Object.entries(unknowns)) assert.throws(() => find(observed), `${what} observation gave a result instead of unknown`);
  assert.throws(() => find(whole, { controls: controls.map((c) => ({ ...c, adapted: true })), observed: [] }), 'a declaration claiming to be adapted was taken as proof');
  for (const bad of [{ controls: null }, { delivered: 'x' }, { observed: undefined }, { revision: '' }]) assert.throws(() => find(whole, bad), 'bad input did not throw');
  // the adapter: a confirmed nonconformance can be baselined, an unknown can not pass even with an allowance
  const { runControl } = await load('adapter.mjs');
  const old = ['unadapted:c/CTL1'];
  const go = (observed, baseline = old) => runControl({ id: 'controls/CTL1', mode: 'ratchet', check: () => find(observed), input: {}, baseline, previous: baseline, boundary: { x: 'real', run: 'r', sha: 's' } });
  assert.equal((await go([ob('c/CTL1', false), ob('c/CTL2', true), ob('c/CTL4', true)])).verdict, 'PASS', 'a baselined confirmed nonconformance was not allowed');
  assert.equal((await go([ob('c/CTL1', false), ob('c/CTL2', false), ob('c/CTL4', true)])).verdict, 'FAIL', 'a new confirmed nonconformance passed the ratchet');
  for (const [what, observed] of Object.entries(unknowns)) {
    const r = await go(observed, ['unadapted:c/CTL1', 'unobserved:c/CTL1', 'unadapted:c/CTL2', 'unadapted:c/CTL4']);
    assert.equal(r.verdict, 'UNKNOWN', `${what} observation passed or was filtered by an allowance`);
    assert.equal(r.blocked, true, `${what} observation did not fail closed in ratchet mode`);
  }
}
