// Case controls/T1103 tests: controls/F32
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o = {}, drop = []) => { const f = { id: 'demo/CTL1', title: 'review access', description: 'Access is reviewed.', type: 'detective', status: 'designed', has: '[demo/I1]', ...o }; for (const k of drop) delete f[k]; return '---\n' + Object.entries(f).map(([k, v]) => k + ': ' + v).join('\n') + '\n---\n# a control\n'; };
const find = async (files, links) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls(files, links); };
const one = async (o, drop) => (await find([{ path: 'x/CTL1.md', text: item(o, drop) }])).controls[0];

export const id = 'controls/T1103';
export const tests = ['controls/F32'];
export const title = 'a station is any name of the right shape and the registry lists a control at it; a wrong shape stays refused';
export async function run() {
  const { registryAt } = await import(pathToFileURL(join(S, 'registry.mjs')).href);
  const files = [{ path: 'x/CTL1.md', text: item({ stations: '[Access-review:detective, Offboarding:preventive]' }) }];
  const c = (await find(files)).controls[0];
  assert.equal(c.valid, true, 'a control with stations of its own names was refused');
  assert.deepEqual(c.stations.map((s) => s.station), ['Access-review', 'Offboarding']);
  assert.deepEqual(registryAt(files, 'Offboarding').map((r) => [r.id, r.mode]), [['demo/CTL1', 'preventive']], 'the registry did not list the control at a station of its own name');
  for (const bad of ['[Offboarding]', '[Offboarding:blocking]', '[Offboarding:preventive, Offboarding:detective]', '[Off boarding:preventive]', '[:preventive]']) {
    assert.equal((await one({ stations: bad })).valid, false, bad + ' was accepted');
  }
}
