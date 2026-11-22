// Case controls/T1111 tests: controls/F34
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const PKG = join(repo, 'packages/kaal-controls');
const S = join(PKG, 'skills/kaal-controls/scripts');
const judge = async (o) => { const f = join(S, 'judge-mode.mjs'); assert.ok(existsSync(f), 'scripts/judge-mode.mjs is absent'); const { judgeMode } = await import(pathToFileURL(f).href); return judgeMode(o); };

export const id = 'controls/T1111';
export const tests = ['controls/F34'];
export const title = 'the package ships an instructions file that names the Skill, which exists, and no other package';
export async function run() {
  const file = join(PKG, 'AGENTS.md');
  assert.ok(existsSync(file), 'the package has no AGENTS.md');
  const pkg = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8'));
  assert.ok(pkg.files.includes('AGENTS.md'), 'package.json does not ship AGENTS.md');
  const text = readFileSync(file, 'utf8');
  const skill = text.match(/skills\/kaal-controls\/SKILL\.md/);
  assert.ok(skill, 'AGENTS.md does not name the Skill');
  assert.ok(existsSync(join(PKG, skill[0])), 'the Skill AGENTS.md names does not exist');
  assert.doesNotMatch(text, /kaal-(?!controls|foundation|hosting)[a-z]+/, 'AGENTS.md names another package');
}
