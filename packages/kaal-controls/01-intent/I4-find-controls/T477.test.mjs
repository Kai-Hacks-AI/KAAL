// Case controls/T477 tests: controls/I4
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
export const id = 'controls/T477';
export const tests = ['controls/I4'];
export const title = 'one command finds every control in a repository, across folders, ignoring Changes and Intents';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const root = mkdtempSync(join(tmpdir(), 'ctl-'));
  const put = (p, t) => { mkdirSync(join(root, p, '..'), { recursive: true }); writeFileSync(join(root, p), t); };
  put('packages/p/00-changes/C1/C1.md', '---\nid: demo/C1\ntitle: c\n---\n');
  put('packages/p/01-intent/I1/I1.md', '---\nid: demo/I1\ntitle: i\n---\n');
  put('packages/p/04-controls/CTL1-a/CTL1.md', item());
  put('packages/p/04-controls/CTL1-a/T9.test.mjs', '// Case demo/T9 tests: demo/CTL1\n');
  put('engineering/e/CTL2-b/CTL2.md', item({ id: 'demo/CTL2' }));
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, root], { encoding: 'utf8' }));
  assert.deepEqual(out.controls.map((c) => c.id).sort(), ['demo/CTL1', 'demo/CTL2']);
  assert.equal(out.controls.find((c) => c.id === 'demo/CTL1').tests.length, 1);
  assert.deepEqual(out.refused, []);
}
