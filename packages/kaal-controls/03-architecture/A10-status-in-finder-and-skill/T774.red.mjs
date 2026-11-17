// Case controls/T774 tests: controls/A10
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
export const id = 'controls/T774';
export const tests = ['controls/A10'];
export const title = 'the Skill reference declares the status and names the four values in order';
export async function run() {
  const ref = readFileSync(join(dir, 'skills/kaal-controls/references/declaring-controls.md'), 'utf8');
  assert.match(ref, /^status: /m, 'the reference shows no status line');
  const at = STATUSES.map((s) => ref.indexOf(s));
  at.forEach((i, k) => assert.ok(i >= 0, `the reference does not name ${STATUSES[k]}`));
  assert.deepEqual([...at].sort((a, b) => a - b), at, 'the reference does not name the four in order');
  const words = readFileSync(join(dir, 'skills/kaal-controls/SKILL.md'), 'utf8').split(/\s+/).filter(Boolean).length;
  assert.ok(words <= 600, `the Skill has ${words} words`);
}
