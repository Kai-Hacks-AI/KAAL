// Case controls/T1513 tests: controls/F204
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
const B = { x: 'real', run: 'r1', sha: 'abc' };
export const id = 'controls/T1513';
export const tests = ['controls/F204'];
export const title = 'the registration check runs through the adapter as a ratchet: the controls that exist are allowed, a new unregistered one fails, and a baseline that grew fails';
export async function run() {
  const { judgeRegistration, runControl } = await load();
  const ctl = (id) => ({ id, status: 'designed', stations: ['S:preventive'], path: `p/${id}.md`, evidence: 'UNKNOWN' });
  const names = (controls) => judgeRegistration({ controls, delivered: [], adapted: [], records: [] }).findings;
  const old = ['unadapted:c/CTL1', 'unadapted:c/CTL2'];
  const go = (controls, baseline = old, previous = old) => runControl({ id: 'controls/registration', mode: 'ratchet', check: () => names(controls), input: {}, baseline, previous, boundary: { x: 'real', run: 'r', sha: 's' } });
  assert.equal((await go([ctl('c/CTL1'), ctl('c/CTL2')])).verdict, 'PASS', 'the controls that exist today were not allowed');
  const added = await go([ctl('c/CTL1'), ctl('c/CTL2'), ctl('c/CTL3')]);
  assert.equal(added.verdict, 'FAIL', 'a new unregistered control passed'); assert.deepEqual(added.new, ['unadapted:c/CTL3']);
  assert.equal((await go([ctl('c/CTL1')])).verdict, 'FAIL', 'a stale allowance for a control that is now registered passed');
  assert.equal((await go([ctl('c/CTL1'), ctl('c/CTL2')], [...old, 'unadapted:c/CTL9'], old)).verdict, 'FAIL', 'a baseline that grew passed');
}
