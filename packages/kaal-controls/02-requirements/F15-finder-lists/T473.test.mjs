// Case controls/T473 tests: controls/F15
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
export const id = 'controls/T473';
export const tests = ['controls/F15'];
export const title = 'the command line finder lists controls found in more than one folder';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const root = mkdtempSync(join(tmpdir(), 'ctl-'));
  for (const [p, o] of [['packages/p/04-controls/CTL1-a/CTL1.md', {}], ['engineering/e/CTL2-b/CTL2.md', { id: 'demo/CTL2' }]]) { mkdirSync(join(root, p, '..'), { recursive: true }); writeFileSync(join(root, p), item(o)); }
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, root], { encoding: 'utf8' }));
  assert.deepEqual(out.controls.map((c) => c.id).sort(), ['demo/CTL1', 'demo/CTL2']);
}
