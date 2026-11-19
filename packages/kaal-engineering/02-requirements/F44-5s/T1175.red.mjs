// Case engineering/T1175 tests: engineering/F44
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const file = join(root, 'packages/kaal-engineering/skills/kaal-engineering/SKILL.md');
const skill = () => { assert.ok(existsSync(file), 'the Skill packages/kaal-engineering/skills/kaal-engineering/SKILL.md is absent'); return readFileSync(file, 'utf8'); };
export const id = 'engineering/T1175';
export const tests = ['engineering/F44'];
export const title = 'the Skill frames the setup with the five Lean 5S words';
export async function run() {
  const t = skill();
  for (const w of ['Sort', 'Set in order', 'Shine', 'Standardize', 'Sustain']) assert.ok(t.includes(w), `the Skill does not name ${w}`);
}
