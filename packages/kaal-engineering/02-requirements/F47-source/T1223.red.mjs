// Case engineering/T1223 tests: engineering/F47
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(root, 'packages/kaal-engineering/skills/kaal-engineering');
const ref = () => { const f = join(dir, 'references/package-layout.md'); assert.ok(existsSync(f), 'the reference packages/kaal-engineering/skills/kaal-engineering/references/package-layout.md is absent'); return readFileSync(f, 'utf8'); };
export const id = 'engineering/T1223';
export const tests = ['engineering/F47'];
export const title = 'the reference splits the source into skill, scripts and unit-tests, and ties them to BASS';
export async function run() {
  const t = ref();
  for (const f of ['skill/', 'scripts/', 'unit-tests/']) assert.ok(t.includes(f), `13-source lacks ${f}`);
  assert.match(t, /Bare to Agent/, 'AGENTS.md is not tied to BASS Bare to Agent');
  assert.match(t, /Agent to Skill/, 'skill/ is not tied to BASS Agent to Skill');
  assert.match(t, /Skill to Script/, 'scripts/ is not tied to BASS Skill to Script');
}
