// Case engineering/T1220 tests: engineering/I3
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(root, 'packages/kaal-engineering/skills/kaal-engineering');
const ref = () => { const f = join(dir, 'references/package-layout.md'); assert.ok(existsSync(f), 'the reference packages/kaal-engineering/skills/kaal-engineering/references/package-layout.md is absent'); return readFileSync(f, 'utf8'); };
export const id = 'engineering/T1220';
export const tests = ['engineering/I3'];
export const title = 'the Skill points to the package layout reference and the reference exists';
export async function run() {
  const t = ref();
  assert.ok(t.trim().length > 0, 'the reference is empty');
  const skill = readFileSync(join(dir, 'SKILL.md'), 'utf8');
  assert.match(skill, /references\/package-layout\.md/, 'SKILL.md does not link the reference');
}
