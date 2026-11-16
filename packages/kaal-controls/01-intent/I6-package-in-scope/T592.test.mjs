// Case controls/T592 tests: controls/I6
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(fileURLToPath(import.meta.url).split('/packages/')[0], 'packages/kaal-controls');
const pkg = () => JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
export const id = 'controls/T592';
export const tests = ['controls/I6'];
export const title = 'the README names the package in the KAAL scope and still points at the Skill';
export async function run() {
  const readme = readFileSync(join(dir, 'README.md'), 'utf8');
  assert.match(readme.split('\n')[0], /^# @kaihacksai\/kaal-controls$/, 'the README title is not scoped');
  assert.ok(readme.includes('skills/kaal-controls/SKILL.md'), 'the README no longer points at the Skill');
}
