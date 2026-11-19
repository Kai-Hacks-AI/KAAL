// Case engineering/T1179 tests: engineering/I2
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const file = join(root, 'packages/kaal-engineering/skills/kaal-engineering/SKILL.md');
const skill = () => { assert.ok(existsSync(file), 'the Skill packages/kaal-engineering/skills/kaal-engineering/SKILL.md is absent'); return readFileSync(file, 'utf8'); };
export const id = 'engineering/T1179';
export const tests = ['engineering/I2'];
export const title = 'the Skill is named kaal-engineering and says in its description that it explains the engineering setup';
export async function run() {
  const t = skill();
  assert.match(t, /^name: kaal-engineering$/m, 'the Skill is named kaal-engineering');
  assert.match(t, /^description: .*engineering setup/m, 'the description says it explains the engineering setup');
}
