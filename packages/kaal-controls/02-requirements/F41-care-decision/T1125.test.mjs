// Case controls/T1125 tests: controls/F41
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const skill = join(repo, 'packages/kaal-controls/skills/kaal-controls');
export const id = 'controls/T1125';
export const tests = ['controls/F41'];
export const title = 'the Skill teaches the four responses and who proposes and selects, in words that name no setup, and stays within its word limit';
export async function run() {
  const ref = join(skill, 'references/care.md');
  assert.ok(existsSync(ref), 'references/care.md is absent');
  const text = readFileSync(ref, 'utf8');
  for (const w of ['Contain', 'Accept', 'Ratchet', 'Eliminate']) assert.ok(text.includes(w), 'care.md does not name ' + w);
  assert.match(text, /proposes/i, 'care.md does not say who proposes');
  assert.match(text, /selects/i, 'care.md does not say who selects');
  assert.match(text, /never accepted by being (old|there)|not accepted by being (old|there)/i, 'care.md does not say that an old finding is not accepted by being old');
  assert.match(text, /not (an )?acceptance|does not accept|never an acceptance/i, 'care.md does not say that a ratchet is not acceptance');
  for (const w of ['KAAL', 'kaal-', 'engineering/', 'packages/', 'CPO', 'Owner', 'collector', 'WIRE', 'PLAN']) assert.ok(!text.includes(w), 'care.md names a setup: ' + w);
  const sk = readFileSync(join(skill, 'SKILL.md'), 'utf8');
  assert.ok(sk.includes('references/care.md'), 'SKILL.md does not point at care.md');
  assert.ok(sk.trim().split(/\s+/).length <= 600, 'SKILL.md is over 600 words');
}
