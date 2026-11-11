// Case controls/T12 tests: F13
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T12';
export const tests = ['controls/F13'];
export const title = 'the Agent Skill separates structural, behavioral and operational evidence, and requires RED against main';
export function run() {
  const skill = read('skills/kaal-controls/SKILL.md', 'the Agent Skill');
  has(skill, ['structural','behavioral','operational'], 'the Agent Skill');
  assert.match(skill, /configured is not operating/i, 'the Agent Skill does not state that configured is not operating');
  assert.match(skill, /RED/, 'the Agent Skill does not require RED');
  assert.match(skill, /`main`/, 'the Agent Skill does not name the baseline of the RED');
}
