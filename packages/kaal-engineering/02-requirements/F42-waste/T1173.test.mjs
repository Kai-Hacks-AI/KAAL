// Case engineering/T1173 tests: engineering/F42
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const file = join(root, 'packages/kaal-engineering/skills/kaal-engineering/SKILL.md');
const skill = () => { assert.ok(existsSync(file), 'the Skill packages/kaal-engineering/skills/kaal-engineering/SKILL.md is absent'); return readFileSync(file, 'utf8'); };
export const id = 'engineering/T1173';
export const tests = ['engineering/F42'];
export const title = 'the Skill says stage copies and deliveries are not waste, and names the two kinds of waste';
export async function run() {
  const t = skill();
  assert.match(t, /not waste/i, 'the Skill says a stage copy and a delivery are not waste');
  assert.match(t, /no stage or delivery role|no role/i, 'waste kind one: a copy that no stage or delivery role explains');
  assert.match(t, /drift/i, 'waste kind two: a delivery that has drifted from its approved source');
}
