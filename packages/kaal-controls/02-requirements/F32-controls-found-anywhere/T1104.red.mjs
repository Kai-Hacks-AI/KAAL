// Case controls/T1104 tests: controls/F32
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o = {}, drop = []) => { const f = { id: 'demo/CTL1', title: 'review access', description: 'Access is reviewed.', type: 'detective', status: 'designed', has: '[demo/I1]', ...o }; for (const k of drop) delete f[k]; return '---\n' + Object.entries(f).map(([k, v]) => k + ': ' + v).join('\n') + '\n---\n# a control\n'; };
const find = async (files, links) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls(files, links); };
const one = async (o, drop) => (await find([{ path: 'x/CTL1.md', text: item(o, drop) }])).controls[0];

export const id = 'controls/T1104';
export const tests = ['controls/F32'];
export const title = 'Cases handed in as links are the only source of the Cases of a control, and with none handed in the first line is read as before';
export async function run() {
  const control = { path: 'x/CTL1.md', text: item({}) };
  const byHeader = { path: 'y/T9.test.mjs', text: '// Case demo/T9 tests: demo/CTL1\nexport {};\n' };
  const none = (await find([control, byHeader])).controls[0];
  assert.deepEqual(none.tests.map((t) => t.id), ['demo/T9'], 'the first line was not read when no links were handed in');
  const links = [{ case: 'demo/T5', tests: ['demo/CTL1'] }, { case: 'demo/T6', tests: ['demo/CTL2'] }];
  const handed = (await find([control, byHeader], links)).controls[0];
  assert.deepEqual(handed.tests.map((t) => t.id), ['demo/T5'], 'a handed-in link did not replace the first line, or a link to another control counted');
  const empty = (await find([control, byHeader], [])).controls[0];
  assert.deepEqual(empty.tests, [], 'an empty list of links was read as no links handed in');
}
