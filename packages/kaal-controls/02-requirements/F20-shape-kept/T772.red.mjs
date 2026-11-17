// Case controls/T772 tests: controls/F20
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const FINDER = join(dir, 'skills/kaal-controls/scripts/find-controls.mjs');
const STATUSES = ['designed', 'implemented', 'running', 'tested'];
async function finder() { assert.ok(existsSync(FINDER), 'the finder is absent'); const m = await import(pathToFileURL(FINDER).href); assert.equal(typeof m.findControls, 'function', 'the finder exports no findControls'); return m.findControls; }
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'verify Stages (Developing)', description: 'Stages are verified before they merge.', type: 'detective', status: 'designed', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const file = (path, text) => ({ path, text });
export const id = 'controls/T772';
export const tests = ['controls/F20'];
export const title = 'adding status keeps what the earlier shape decides';
export async function run() {
  const find = await finder();
  assert.equal(find([file('x/CTL1.md', item())]).controls.length, 1, 'a control with a status was not listed');
  assert.equal(find([file('x/CTL1.md', item({ type: undefined }))]).refused.length, 1, 'a control without a type was listed');
  assert.equal(find([file('x/CTL1.md', item({ has: '[]' }))]).refused.length, 1, 'a control with no Intent was listed');
  assert.equal(find([file('x/CTL1.md', item({ tests: '[demo/T1]' }))]).refused.length, 1, 'a control with a tests field was listed');
  assert.equal(find([file('x/CTL1.md', item({ state: 'open' }))]).refused.length, 1, 'a control with a state field was listed');
  assert.equal(find([file('a/CTL1.md', item()), file('b/CTL1.md', item())]).refused.length, 2, 'a duplicate id was listed');
  assert.equal(find([file('x/C8.md', item({ id: 'demo/C8' }))]).controls.length, 0, 'a Change id was read as a control');
}
