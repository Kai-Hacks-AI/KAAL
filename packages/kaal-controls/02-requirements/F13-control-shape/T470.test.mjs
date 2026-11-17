// Case controls/T470 tests: controls/F13
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const FINDER = join(dir, 'skills/kaal-controls/scripts/find-controls.mjs');
async function finder() { assert.ok(existsSync(FINDER), 'the finder is absent'); const m = await import(pathToFileURL(FINDER).href); assert.equal(typeof m.findControls, 'function', 'the finder exports no findControls'); return m.findControls; }
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'verify Stages (Developing)', description: 'Stages are verified before they merge.', type: 'detective', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const file = (path, text) => ({ path, text });
export const id = 'controls/T470';
export const tests = ['controls/F13'];
export const title = 'a valid control is listed with its id, title, description and has';
export async function run() {
  const find = await finder();
  const r = find([file('x/CTL1-a/CTL1.md', item())]);
  assert.deepEqual(r.refused, []);
  assert.equal(r.controls.length, 1);
  const c = r.controls[0];
  assert.deepEqual([c.id, c.title, c.description, c.has], ['demo/CTL1', 'verify Stages (Developing)', 'Stages are verified before they merge.', ['demo/I1']]);
}
