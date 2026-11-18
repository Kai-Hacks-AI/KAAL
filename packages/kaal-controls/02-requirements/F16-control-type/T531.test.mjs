// Case controls/T531 tests: controls/F16
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
export const id = 'controls/T531';
export const tests = ['controls/F16'];
export const title = 'an item without a type stays listed and fails validation naming the type';
export async function run() {
  const find = await finder();
  const r = find([file('x/CTL1.md', item({ type: undefined }))]);
  assert.equal(r.controls.length, 1, 'an item without a type dropped out of the inventory');
  assert.equal(r.controls[0].valid, false);
  assert.ok(r.controls[0].problems.some((p) => p.field === 'type' && /type/.test(p.reason)));
  assert.equal(r.refused.length, 1);
  assert.match(r.refused[0].reason, /type/);
}
