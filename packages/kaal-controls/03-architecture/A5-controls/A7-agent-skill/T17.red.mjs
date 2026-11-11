// Case controls/T17 tests: A7
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T17';
export const tests = ['controls/A7'];
export const title = 'the Agent Skill is named kaal-controls and carries a description';
export function run() {
  const skill = read('skills/kaal-controls/SKILL.md', 'the Agent Skill');
  assert.match(skill, /^---\nname: kaal-controls\n/); assert.match(skill, /\ndescription: .+/);
}
