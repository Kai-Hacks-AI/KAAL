// Case controls/T471 tests: controls/F13
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
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'verify Stages (Developing)', description: 'Stages are verified before they merge.', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const file = (path, text) => ({ path, text });
export const id = 'controls/T471';
export const tests = ['controls/F13'];
export const title = 'an item without title, description or has, or with an empty has, is refused whole';
export async function run() {
  const find = await finder();
  for (const [name, o] of [['title', { title: undefined }], ['description', { description: undefined }], ['has', { has: undefined }], ['an empty has', { has: '[]' }]]) {
    const r = find([file('x/CTL1.md', item(o))]);
    assert.equal(r.controls.length, 0, `an item with ${name} missing was listed`);
    assert.equal(r.refused.length, 1, `an item with ${name} missing was not refused`);
  }
}
