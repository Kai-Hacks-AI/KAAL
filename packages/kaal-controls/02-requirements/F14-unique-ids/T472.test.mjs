// Case controls/T472 tests: controls/F14
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
export const id = 'controls/T472';
export const tests = ['controls/F14'];
export const title = 'two items with the same id are both refused and a Change id is not read as a control';
export async function run() {
  const find = await finder();
  const r = find([file('a/CTL1.md', item()), file('b/CTL1.md', item({ title: 'other' })), file('c/C8.md', '---\nid: demo/C8\ntitle: a change\n---\n')]);
  assert.equal(r.controls.length, 0, 'a duplicated id was listed');
  assert.equal(r.refused.length, 2, 'both items with the duplicated id must be refused');
  assert.ok(r.refused.every((x) => /duplicate/i.test(x.reason)), 'the refusal does not say duplicate');
}
