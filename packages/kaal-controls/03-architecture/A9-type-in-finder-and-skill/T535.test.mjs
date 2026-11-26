// Case controls/T535 tests: controls/A9
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
export const id = 'controls/T535';
export const tests = ['controls/A9'];
export const title = 'the Skill reference declares the type and names the four values';
export async function run() {
  const ref = readFileSync(join(dir, 'skills/kaal-controls/references/declaring-controls.md'), 'utf8');
  assert.match(ref, /^type: /m, 'the reference shows no type line');
  for (const t of TYPES) assert.ok(ref.includes(t), `the reference does not name ${t}`);
  const words = readFileSync(join(dir, 'skills/kaal-controls/SKILL.md'), 'utf8').split(/\s+/).filter(Boolean).length;
  assert.ok(words <= 600, `the Skill has ${words} words`);
}
