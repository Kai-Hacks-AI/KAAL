// Case controls/T1519 tests: controls/F208
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
const claim = (o = {}) => ({ defined: true, implemented: true, running: true, tested: true, ...o });
const facts = (o = {}) => ({ defined: true, implemented: true, running: true, tested: true, ...o });
export const id = 'controls/T1519';
export const tests = ['controls/F208'];
export const title = 'verify Record names each declared claim that lags or overclaims its own fact, compares the four facts independently, and treats a missing proof as unknown';
export async function run() {
  const { findDisagreeing } = await load('verify-record.mjs');
  const f = (controls, fs) => findDisagreeing({ controls, facts: fs });
  assert.deepEqual(f([{ id: 'c/CTL1', claimed: claim({ running: false }) }, { id: 'c/CTL2', claimed: claim() }], { 'c/CTL1': facts(), 'c/CTL2': facts({ implemented: false }) }), ['implemented:overclaims:c/CTL2', 'running:lags:c/CTL1'], 'a lag or an overclaim was missed, or an agreeing control was named');
  assert.deepEqual(f([{ id: 'c/CTL1', claimed: claim({ running: false, tested: true }) }], { 'c/CTL1': facts({ running: true, tested: true }) }), ['running:lags:c/CTL1'], 'a passing tested settled a running that lags');
  assert.deepEqual(f([{ id: 'c/CTL1', claimed: claim() }], { 'c/CTL1': { defined: true, implemented: null, running: undefined, tested: true } }), [], 'a missing proof was taken as absence');
  assert.deepEqual(f([{ id: 'c/CTL1', claimed: claim() }], { 'c/CTL1': facts() }), []);
  for (const bad of [{ controls: null }, { facts: 'x' }, { facts: {} }, { controls: [{ id: 'c/CTL1', claimed: { running: 'yes' } }] }]) assert.throws(() => findDisagreeing({ controls: [{ id: 'c/CTL1', claimed: claim() }], facts: { 'c/CTL1': facts() }, ...bad }), 'bad or incomplete input did not throw: ' + JSON.stringify(bad));
}
