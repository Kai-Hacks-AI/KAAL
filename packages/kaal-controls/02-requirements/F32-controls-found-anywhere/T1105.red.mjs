// Case controls/T1105 tests: controls/F32
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o = {}, drop = []) => { const f = { id: 'demo/CTL1', title: 'review access', description: 'Access is reviewed.', type: 'detective', status: 'designed', has: '[demo/I1]', ...o }; for (const k of drop) delete f[k]; return '---\n' + Object.entries(f).map(([k, v]) => k + ': ' + v).join('\n') + '\n---\n# a control\n'; };
const find = async (files, links) => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls(files, links); };
const one = async (o, drop) => (await find([{ path: 'x/CTL1.md', text: item(o, drop) }])).controls[0];

export const id = 'controls/T1105';
export const tests = ['controls/F32'];
export const title = 'the line of a control in the state report starts with its id, its title and its type';
export async function run() {
  const { judgeEvidence, stateLine } = await import(pathToFileURL(join(S, 'evidence.mjs')).href);
  const c = await one({ title: 'approve Sync', type: 'preventive', status: 'running', evidence: '[fixture:1, provoked:1:fail]' });
  const line = stateLine(c, judgeEvidence(c, []));
  assert.ok(!line.includes('\n'), 'the state is more than one line');
  assert.ok(line.startsWith('demo/CTL1 · approve Sync · preventive · claimed running'), 'the line does not start with id, title and type: ' + line);
}
