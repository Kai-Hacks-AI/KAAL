// Case controls/T532 tests: controls/F16
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
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'verify Stages (Developing)', description: 'Stages are verified before they merge.', type: 'detective', status: 'designed', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const file = (path, text) => ({ path, text });
export const id = 'controls/T532';
export const tests = ['controls/F16'];
export const title = 'a type outside the four stays listed, fails validation and the problem names the type';
export async function run() {
  const find = await finder();
  assert.equal(find([file('x/CTL1.md', item({ type: 'detective' }))]).controls[0].valid, true, 'a detective control was not valid');
  for (const bad of ['Detective', 'detect', 'monitoring', 'directive, detective', '""']) {
    const r = find([file('x/CTL1.md', item({ type: bad }))]);
    assert.equal(r.controls.length, 1, `type ${bad} dropped the control from the inventory`);
    assert.equal(r.controls[0].valid, false, `type ${bad} was valid`);
    assert.ok(r.controls[0].problems.some((p) => p.field === 'type'));
    assert.equal(r.refused.length, 1);
    assert.match(r.refused[0].reason, /type/);
  }
}
