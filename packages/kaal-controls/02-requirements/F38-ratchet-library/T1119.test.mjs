// Case controls/T1119 tests: controls/F38
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'check layout', description: 'The layout is in spec.', type: 'preventive', status: 'designed', has: '[demo/I1]', strategy: 'ratchet', 'baseline-source': 'x/baseline.json', owner: 'demo', exit: 'plain preventive at an empty baseline', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => k + ': ' + v).join('\n') + '\n---\n# a control\n'; };
const find = async (o, baseline) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); const files = [{ path: 'x/CTL1.md', text: item(o) }]; if (baseline !== undefined) files.push({ path: 'x/baseline.json', text: baseline }); return findControls(files).controls[0]; };
export const id = 'controls/T1119';
export const tests = ['controls/F38'];
export const title = 'the ratchet library exists and the baseline of a ratchet is a mandatory file the finder checks';
export async function run() {
  const lib = join(S, 'ratchet.mjs');
  assert.ok(existsSync(lib), 'scripts/ratchet.mjs is absent');
  const { judgeRun } = await import(pathToFileURL(lib).href);
  const { judgeMode } = await import(pathToFileURL(join(S, 'judge-mode.mjs')).href);
  for (const input of [{ findings: ['a', 'b'], baseline: ['a', 'b'], previous: ['a', 'b'] }, { findings: ['a', 'b', 'n'], baseline: ['a', 'b'], previous: ['a', 'b'] }, { findings: ['a'], baseline: ['a', 'b'], previous: ['a', 'b'] }])
    assert.deepEqual(judgeRun(input), judgeMode({ mode: 'ratchet', ...input }), 'the library and judge-mode differ');
  assert.equal((await find({}, '["a","b"]')).valid, true, 'a ratchet with a baseline file was refused');
  assert.equal((await find({}, '[]')).valid, true, 'an empty baseline file was refused');
  for (const [label, o, b] of [['no file among the files', {}, undefined], ['prose as the source', { 'baseline-source': 'the workflows of the base commit' }, '["a"]'], ['not JSON', {}, 'a, b'], ['not a list', {}, '{"a":1}'], ['not strings', {}, '[1,2]'], ['a name twice', {}, '["a","a"]']]) {
    const c = await find(o, b);
    assert.equal(c.valid, false, label + ' was accepted');
    assert.ok(c.problems.some((p) => p.field === 'baseline-source' && p.recovery), label + ': baseline-source was not named with a recovery');
  }
}
