// Case controls/T8 tests: I3
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const read = (rel, what) => { const path = join(pkg, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const has = (text, words, what) => { for (const w of words) assert.ok(text.toLowerCase().includes(w.toLowerCase()), `${what} does not state ${w}`); };
export const id = 'controls/T8';
export const tests = ['controls/I3'];
export const title = 'an agent has what it needs to design a control: the contract, the guide and a worked example';
export function run() {
  read('capability/Controls.md', 'the Controls Node'); read('skills/kaal-controls/SKILL.md', 'the Agent Skill'); read('skills/kaal-controls/references/verify-dependencies.md', 'the worked example');
}
