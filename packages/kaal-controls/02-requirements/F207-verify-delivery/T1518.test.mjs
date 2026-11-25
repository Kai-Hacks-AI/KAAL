// Case controls/T1518 tests: controls/F207
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
const ctl = (id, over = {}) => ({ id, status: 'designed', stations: [], path: `p/${id}.md`, mode: 'off', evidence: 'UNKNOWN', ...over });
const rec = (control, over = {}) => ({ control, x: 'real', run: 'r', sha: 's', verdict: 'PASS', by: 'adapter', ...over });
export const id = 'controls/T1518';
export const tests = ['controls/F207'];
export const title = 'verify Delivery names a delivered entry that no control declares';
export async function run() {
  const { findUnrecorded } = await load('verify-delivery.mjs');
  const controls = [ctl('c/CTL1'), ctl('c/CTL2', { path: 'a/CTL2.md' })];
  assert.deepEqual(findUnrecorded({ controls, delivered: ['c/CTL1', 'a/CTL2.md', 'x/orphan.yml', 'y/other.yml'] }), ['unrecorded:x/orphan.yml', 'unrecorded:y/other.yml'], 'an undeclared delivered entry was missed, or a declared one was named');
  assert.deepEqual(findUnrecorded({ controls, delivered: [] }), []);
  for (const bad of [{ controls: {} }, { delivered: null }]) assert.throws(() => findUnrecorded({ controls, delivered: [], ...bad }), 'bad input did not throw');
  const { runControl } = await load('adapter.mjs');
  const old = ['unrecorded:x/orphan.yml'];
  const go = (delivered) => runControl({ id: 'controls/CTL2', mode: 'ratchet', check: () => findUnrecorded({ controls, delivered }), input: {}, baseline: old, previous: old, boundary: { x: 'real', run: 'r', sha: 's' } });
  assert.equal((await go(['x/orphan.yml'])).verdict, 'PASS', 'an old undeclared entry was not allowed');
  assert.equal((await go(['x/orphan.yml', 'z/new.yml'])).verdict, 'FAIL', 'a new undeclared entry passed the ratchet');
}
