// Case controls/T1503 tests: controls/F200
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const skill = join(repo, 'packages/kaal-controls/skills/kaal-controls');
const lib = join(skill, 'scripts/accept.mjs');
const acc = (control, testCase, over = {}) => ({ control, testCase, defect: 'D1', owner: 'o', reason: 'because', ...over });
export const id = 'controls/T1503';
export const tests = ['controls/F200'];
export const title = 'the Skill teaches that a finding becomes a Test Case and a Defect, that an accepted failure stays FAIL flagged ACCEPTED, that delivery is permitted for the named failure only, and that a new failure does not inherit it, in words that name no setup, and stays within its word limit';
export async function run() {
  const ref = join(skill, 'references/acceptance.md');
  assert.ok(existsSync(ref), 'references/acceptance.md is absent');
  const text = readFileSync(ref, 'utf8');
  for (const w of ['Test Case', 'Defect', 'FAIL', 'ACCEPTED']) assert.ok(text.includes(w), 'acceptance.md does not name ' + w);
  assert.match(text, /never (makes|turns|becomes|is)?[^.]*PASS|not (a )?PASS/i, 'acceptance.md does not say that acceptance never makes a PASS');
  assert.match(text, /new or different failure/i, 'acceptance.md does not say that a new or different failure is not covered');
  assert.match(text, /only|exactly/i, 'acceptance.md does not say that an acceptance covers only what it names');
  for (const w of ['KAAL', 'kaal-', 'engineering/', 'packages/', 'CPO', 'Owner', 'collector', 'WIRE', 'PLAN']) assert.ok(!text.includes(w), 'acceptance.md names a setup: ' + w);
  const sk = readFileSync(join(skill, 'SKILL.md'), 'utf8');
  assert.ok(sk.includes('references/acceptance.md'), 'SKILL.md does not point at acceptance.md');
  assert.ok(sk.trim().split(/\s+/).length <= 600, 'SKILL.md is over 600 words');
}
