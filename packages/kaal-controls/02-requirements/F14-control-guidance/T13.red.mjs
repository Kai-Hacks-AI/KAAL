// Case controls/T13 tests: F14
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T13';
export const tests = ['controls/F14'];
export const title = 'the Agent Skill has the seven steps in order and is at most 900 words';
export function run() {
  const skill = read('skills/kaal-controls/SKILL.md', 'the Agent Skill');
  const steps = ['1. Intent','2. Control type','3. Requirements','4. Architecture','5. Cases','6. RED','7. DO and evidence'];
  let at = -1;
  for (const step of steps) { const next = skill.indexOf(`## ${step}`); assert.ok(next > at, `step ${step} is missing or out of order`); at = next; }
  const words = skill.split(/\s+/).filter(Boolean).length;
  assert.ok(words <= 900, `the Agent Skill has ${words} words, more than 900`);
}
