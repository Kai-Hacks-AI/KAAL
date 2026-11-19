// Case controls/T475 tests: controls/F15
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
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'verify Stages (Developing)', description: 'Stages are verified before they merge.', type: 'detective', status: 'designed', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const file = (path, text) => ({ path, text });
export const id = 'controls/T475';
export const tests = ['controls/F15'];
export const title = 'the finder lists the Cases that point at a control, found from the Case side';
export async function run() {
  const find = await finder();
  const r = find([file('x/CTL1/CTL1.md', item()), file('x/CTL1/T9.test.mjs', '// Case demo/T9 tests: demo/CTL1\nexport const id = \'demo/T9\';\n'), file('x/CTL2/CTL2.md', item({ id: 'demo/CTL2' }))]);
  const by = Object.fromEntries(r.controls.map((c) => [c.id, c]));
  assert.deepEqual(by['demo/CTL1'].tests.map((t) => t.id), ['demo/T9']);
  assert.deepEqual(by['demo/CTL2'].tests, [], 'a control with no Case must still be listed, with none');
}
