// Case engineering/T1227 tests: engineering/A3
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(root, 'packages/kaal-engineering/skills/kaal-engineering');
const ref = () => { const f = join(dir, 'references/package-layout.md'); assert.ok(existsSync(f), 'the reference packages/kaal-engineering/skills/kaal-engineering/references/package-layout.md is absent'); return readFileSync(f, 'utf8'); };
export const id = 'engineering/T1227';
export const tests = ['engineering/A3'];
export const title = 'the reference sits inside the Skill, is linked once, adds no script and keeps the Skill valid';
export async function run() {
  const skill = readFileSync(join(dir, 'SKILL.md'), 'utf8');
  assert.equal(skill.split('](references/package-layout.md)').length - 1, 1, 'SKILL.md links the reference exactly once');
  assert.ok(existsSync(join(dir, 'references/package-layout.md')), 'the reference is not at references/package-layout.md');
  assert.ok(!existsSync(join(dir, 'scripts')), 'the Skill gained a script');
  const pkg = JSON.parse(readFileSync(join(root, 'packages/kaal-engineering/package.json'), 'utf8'));
  assert.deepEqual([...(pkg.files ?? [])].sort(), ['payload', 'skills'], 'the package ships more than payload and skills');
}
