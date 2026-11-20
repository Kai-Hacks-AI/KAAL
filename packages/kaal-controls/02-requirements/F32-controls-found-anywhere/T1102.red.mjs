// Case controls/T1102 tests: controls/F32
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o = {}, drop = []) => { const f = { id: 'demo/CTL1', title: 'review access', description: 'Access is reviewed.', type: 'detective', status: 'designed', has: '[demo/I1]', ...o }; for (const k of drop) delete f[k]; return '---\n' + Object.entries(f).map(([k, v]) => k + ': ' + v).join('\n') + '\n---\n# a control\n'; };
const find = async (files, links) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls(files, links); };
const one = async (o, drop) => (await find([{ path: 'x/CTL1.md', text: item(o, drop) }])).controls[0];

export const id = 'controls/T1102';
export const tests = ['controls/F32'];
export const title = 'a control names its Intent as linked objects or in its own words, exactly one of them, and the finder says which';
export async function run() {
  const linked = await one({});
  assert.equal(linked.valid, true, 'a control with linked Intents was refused');
  assert.equal(linked.intentForm, 'linked', 'a linked Intent was not reported as linked');
  const stated = await one({ intent: 'People who leave lose their access.' }, ['has']);
  assert.equal(stated.valid, true, 'a control that states its Intent in its own words was refused');
  assert.equal(stated.intentForm, 'stated', 'a stated Intent was not reported as stated');
  for (const [name, o, drop] of [['neither form', {}, ['has']], ['an empty statement', { intent: '' }, ['has']], ['both forms', { intent: 'People who leave lose their access.' }, []]]) {
    const c = await one(o, drop);
    assert.equal(c.valid, false, name + ' was accepted');
    assert.ok(c.problems.some((p) => p.field === 'intent' || p.field === 'has'), name + ' named no problem on the Intent');
  }
}
