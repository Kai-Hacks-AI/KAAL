// Case controls/T1118 tests: controls/F37
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'check layout', description: 'The layout is in spec.', type: 'preventive', status: 'designed', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => k + ': ' + v).join('\n') + '\n---\n# a control\n'; };
const one = async (o) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls([{ path: 'x/CTL1.md', text: item(o) }]).controls[0]; };
const full = { strategy: 'ratchet', 'baseline-source': 'the accepted state of the previous release', owner: 'release', exit: 'it becomes plain preventive when the baseline is empty' };
export const id = 'controls/T1118';
export const tests = ['controls/F37'];
export const title = 'a ratchet is declared as a strategy of a preventive control, and X:ratchet is refused';
export async function run() {
  assert.equal((await one({ stations: '[Integrating:preventive]', ...full })).valid, true, 'a preventive control with its full strategy was refused');
  const st = await one({ stations: '[Integrating:ratchet]', ...full });
  assert.equal(st.valid, false, 'a ratchet station mode was accepted');
  assert.ok(st.problems.some((p) => p.field === 'stations' && /strategy/.test(p.recovery)), 'the recovery does not point at the strategy');
  for (const k of ['baseline-source', 'owner', 'exit']) {
    const c = await one({ ...full, [k]: undefined });
    assert.equal(c.valid, false, 'a ratchet without ' + k + ' was accepted');
    assert.ok(c.problems.some((p) => p.field === k), k + ' was not named');
  }
  assert.equal((await one({ ...full, strategy: 'sometimes' })).valid, false, 'a strategy other than ratchet was accepted');
  assert.equal((await one({ ...full, type: 'detective' })).valid, false, 'a ratchet strategy on a detective control was accepted');
  for (const k of ['baseline-source', 'owner', 'exit']) assert.equal((await one({ [k]: 'x' })).valid, false, k + ' without the strategy was accepted');
  assert.equal((await one({ ...full, deadline: '2026-12-02' })).valid, false, 'a deadline was accepted as a field of a control');
}
