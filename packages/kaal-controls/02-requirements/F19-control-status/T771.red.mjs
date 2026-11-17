// Case controls/T771 tests: controls/F19
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
export const id = 'controls/T771';
export const tests = ['controls/F19'];
export const title = 'a missing, empty or other status is refused whole and the reason names the status';
export async function run() {
  const find = await finder();
  assert.equal(find([file('x/CTL1.md', item({ status: 'running' }))]).controls.length, 1, 'a running control was not listed');
  for (const bad of [undefined, '""', 'Running', 'defined', 'enforced', 'proven', 'effective', 'running, tested']) {
    const r = find([file('x/CTL1.md', item({ status: bad }))]);
    assert.equal(r.controls.length, 0, `status ${bad} was listed`);
    assert.equal(r.refused.length, 1);
    assert.match(r.refused[0].reason, /status/);
  }
}
