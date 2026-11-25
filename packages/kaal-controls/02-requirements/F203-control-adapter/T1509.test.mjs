// Case controls/T1509 tests: controls/F203
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
const B = { x: 'real', run: 'r1', sha: 'abc' };
export const id = 'controls/T1509';
export const tests = ['controls/F203'];
export const title = 'a control run through the adapter gets the verdict of its mode, and fails closed when the check could not judge';
export async function run() {
  const { runControl } = await load();
  const go = (over) => runControl({ id: 'c/CTL1', mode: 'preventive', check: () => [], input: {}, boundary: B, ...over });
  assert.equal((await go({})).verdict, 'PASS');
  const f = await go({ check: () => ['a'] });
  assert.equal(f.verdict, 'FAIL'); assert.equal(f.blocked, true);
  assert.equal((await go({ mode: 'detective', check: () => ['a'] })).blocked, false, 'a detective control blocked');
  const rat = await go({ mode: 'ratchet', check: () => ['a', 'b'], baseline: ['a', 'b'], previous: ['a', 'b'] });
  assert.equal(rat.verdict, 'PASS', 'the ratchet filter was not applied');
  assert.equal((await go({ mode: 'ratchet', check: () => ['a', 'c'], baseline: ['a'], previous: ['a'] })).verdict, 'FAIL', 'a new finding passed the ratchet');
  for (const bad of [{ check: () => { throw new Error('x'); } }, { check: () => 'nope' }, { check: () => ['a', 'a'] }, { mode: 'advisory' }, { id: '' }, { mode: 'ratchet', baseline: ['a'] }]) {
    const r = await go(bad);
    assert.equal(r.verdict, 'UNKNOWN', 'a check that could not judge was not UNKNOWN: ' + JSON.stringify(Object.keys(bad)));
    assert.notEqual(r.verdict, 'PASS');
  }
  assert.equal((await go({ mode: 'detective', check: () => { throw new Error('x'); } })).blocked, false, 'a detective UNKNOWN must not block');
}
