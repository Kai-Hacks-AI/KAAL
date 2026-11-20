// Case engineering/T1174 tests: engineering/F43
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const file = join(root, 'packages/kaal-engineering/skills/kaal-engineering/SKILL.md');
const skill = () => { assert.ok(existsSync(file), 'the Skill packages/kaal-engineering/skills/kaal-engineering/SKILL.md is absent'); return readFileSync(file, 'utf8'); };
export const id = 'engineering/T1174';
export const tests = ['engineering/F43'];
export const title = 'the Skill names the two legs, the ratchet from package to engineering (waste down, clean up) and a manual WIRE with the same mechanics from either source, at different pace';
export async function run() {
  const t = skill();
  assert.match(t, /ratchet/i, 'the Skill names the ratchet');
  assert.match(t, /waste[^\n]*down|down[^\n]*waste/i, 'the ratchet takes waste down');
  assert.match(t, /clean[^\n]*up|up[^\n]*clean/i, 'the ratchet takes clean up');
  assert.match(t, /manual/i, 'the second leg is manual');
  assert.match(t, /same mechanics/i, 'the mechanics are the same from either source');
  assert.match(t, /pace/i, 'the two legs move at different pace');
}
