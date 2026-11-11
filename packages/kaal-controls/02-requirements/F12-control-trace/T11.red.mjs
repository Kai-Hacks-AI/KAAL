// Case controls/T11 tests: F12
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T11';
export const tests = ['controls/F12'];
export const title = 'the Agent Skill traces a control through Intent, Requirements, Architecture and Cases with the shared relationships, and defines none';
export function run() {
  const skill = read('skills/kaal-controls/SKILL.md', 'the Agent Skill');
  has(skill, ['Intent','Requirements','Architecture','Cases'], 'the Agent Skill');
  has(skill, ['implements','serves','addresses','tests'], 'the Agent Skill (the relationships)');
  has(skill, ['kaal-graph'], 'the Agent Skill (the owner of the relationship model)');
}
