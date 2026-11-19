// Case engineering/T1177 tests: engineering/N19
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const file = join(root, 'packages/kaal-engineering/skills/kaal-engineering/SKILL.md');
const skill = () => { assert.ok(existsSync(file), 'the Skill packages/kaal-engineering/skills/kaal-engineering/SKILL.md is absent'); return readFileSync(file, 'utf8'); };
export const id = 'engineering/T1177';
export const tests = ['engineering/N19'];
export const title = 'the package is private and ships a Skill only: no bin, no script, no control, no code';
export async function run() {
  const dir = join(root, 'packages/kaal-engineering');
  assert.ok(existsSync(join(dir, 'package.json')), 'packages/kaal-engineering/package.json is absent');
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  assert.equal(pkg.name, '@kaihacksai/kaal-engineering');
  assert.equal(pkg.private, true, 'the package is private');
  assert.equal(pkg.bin, undefined, 'the package has no command');
  assert.deepEqual([...(pkg.files ?? [])].sort(), ['payload', 'skills'], 'the package ships payload and skills only');
  assert.ok(!existsSync(join(dir, 'skills/kaal-engineering/scripts')), 'the Skill has no script');
  assert.ok(!existsSync(join(dir, '04-controls')), 'the package declares no control');
}
