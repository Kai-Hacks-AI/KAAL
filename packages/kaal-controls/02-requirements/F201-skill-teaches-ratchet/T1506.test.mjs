// Case controls/T1506 tests: controls/F201
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const skill = join(repo, 'packages/kaal-controls/skills/kaal-controls');
export const id = 'controls/T1506';
export const tests = ['controls/F201'];
export const title = 'the description of SKILL.md names a ratchet, a baseline and non-regression';
export async function run() {
  const file = join(skill, 'SKILL.md');
  assert.ok(existsSync(file), 'SKILL.md is absent');
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(m, 'SKILL.md has no frontmatter');
  const d = m[1].match(/^description:\s*([\s\S]*?)(?=\n[a-z-]+:|$)/m);
  assert.ok(d, 'SKILL.md has no description');
  for (const word of ['ratchet', 'baseline', 'non-regression']) assert.ok(d[1].toLowerCase().includes(word), `the description does not name "${word}"`);
}
