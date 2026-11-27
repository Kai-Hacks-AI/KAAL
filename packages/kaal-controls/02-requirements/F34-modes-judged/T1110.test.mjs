// Case controls/T1110 tests: controls/F34
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const PKG = join(repo, 'packages/kaal-controls');
const S = join(PKG, 'skills/kaal-controls/scripts');
const judge = async (o) => { const f = join(S, 'judge-mode.mjs'); assert.ok(existsSync(f), 'scripts/judge-mode.mjs is absent'); const { judgeMode } = await import(pathToFileURL(f).href); return judgeMode(o); };

const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'check layout', description: 'The layout is in spec.', type: 'preventive', status: 'designed', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).map(([k, v]) => k + ': ' + v).join('\n') + '\n---\n# a control\n'; };
const one = async (o) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls([{ path: 'x/CTL1.md', text: item(o) }], { stations: ['Integrating'] }).controls[0]; };
export const id = 'controls/T1110';
export const tests = ['controls/F34'];
export const title = 'two modes are accepted at a station, ratchet is no station mode, and a mode outside the two stays refused';
export async function run() {
  for (const m of ['detective', 'preventive']) assert.equal((await one({ stations: '[Integrating:' + m + ']' })).valid, true, m + ' was refused');
  assert.equal((await one({ stations: '[Integrating:ratchet]' })).valid, false, 'a ratchet station mode was accepted');
  const noStrategy = await one({ stations: '[Integrating:preventive]', exit: 'not needed' });
  assert.equal(noStrategy.valid, false, 'an exit without the strategy was accepted');
  assert.ok(noStrategy.problems.some((p) => p.field === 'exit'), 'the exit without a strategy was not named');
  assert.equal((await one({ stations: '[Integrating:advisory]' })).valid, false, 'advisory was accepted');
  assert.equal((await one({ stations: '[Integrating:sometimes]' })).valid, false, 'a mode outside the two was accepted');
}
