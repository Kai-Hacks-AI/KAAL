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
export const title = 'every incomplete declaration stays in the inventory and fails validation with each missing or invalid field named';
export async function run() {
  const find = await finder();
  const field = (text, name) => { const r = find([file('x/CTL1.md', text)]); assert.equal(r.controls.length, 1, `a control with a bad ${name} dropped out of the inventory`); const c = r.controls[0]; assert.equal(c.valid, false); assert.ok(c.problems.some((p) => p.field === name && p.recovery), `${name} is not named with a recovery`); return c; };
  field(item({ type: undefined }), 'type');
  field(item({ type: 'monitoring' }), 'type');
  field(item({ title: undefined }), 'title');
  field(item({ description: undefined }), 'description');
  field(item({ has: '[]' }), 'has');
  field(item({ tests: '[demo/T1]' }), 'tests');
  field(item({ state: 'open' }), 'state');
  const both = find([file('x/CTL1.md', item({ type: undefined, status: undefined }))]).controls[0];
  assert.deepEqual(both.problems.map((p) => p.field).sort(), ['status', 'type'], 'not every problem is named');
  const dup = find([file('a/CTL1.md', item()), file('b/CTL1.md', item())]);
  assert.equal(dup.controls.length, 2, 'a duplicate id dropped out of the inventory');
  assert.ok(dup.controls.every((c) => !c.valid && c.problems.some((p) => p.field === 'id')), 'a duplicate id was not named');
  const mix = find([file('a/CTL1.md', item()), file('b/CTL2.md', item({ id: 'demo/CTL2', status: undefined }))]);
  assert.deepEqual(mix.controls.map((c) => c.valid), [true, false], 'a valid and an incomplete control are not told apart');
  assert.equal(find([file('x/C8.md', item({ id: 'demo/C8' }))]).controls.length, 0, 'a Change id was read as a control');
}
