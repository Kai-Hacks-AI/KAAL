// Case controls/T533 tests: controls/F17
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const FINDER = join(dir, 'skills/kaal-controls/scripts/find-controls.mjs');
const TYPES = ['directive', 'preventive', 'detective', 'corrective'];
async function finder() { assert.ok(existsSync(FINDER), 'the finder is absent'); const m = await import(pathToFileURL(FINDER).href); assert.equal(typeof m.findControls, 'function', 'the finder exports no findControls'); return m.findControls; }
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'verify Stages (Developing)', description: 'Stages are verified before they merge.', type: 'detective', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const file = (path, text) => ({ path, text });
export const id = 'controls/T533';
export const tests = ['controls/F17', 'controls/N6'];
export const title = 'with a type every earlier refusal holds and no further field is allowed';
export async function run() {
  const find = await finder();
  assert.equal(find([file('x/CTL1.md', item())]).controls.length, 1, 'a typed control was not listed');
  const refuse = (files, why) => { const r = find(files); assert.equal(r.controls.length, 0, why); assert.ok(r.refused.length >= 1, why); };
  for (const field of ['title', 'description']) refuse([file('x/CTL1.md', item({ [field]: undefined }))], `no ${field}`);
  refuse([file('x/CTL1.md', item({ has: '[]' }))], 'empty has');
  refuse([file('x/CTL1.md', item({ has: undefined }))], 'no has');
  for (const extra of [{ state: 'active' }, { tests: '[demo/T9]' }, { owner: 'cto' }, { enforces: 'main' }, { status: 'live' }]) refuse([file('x/CTL1.md', item(extra))], `extra ${Object.keys(extra)[0]}`);
  refuse([file('x/CTL1.md', item()), file('y/CTL1.md', item())], 'duplicate id');
  assert.equal(find([file('x/C8.md', item({ id: 'demo/C8' }))]).controls.length, 0, 'a Change id was read as a control');
}
