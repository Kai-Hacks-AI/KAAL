// Case defect/T1211 tests: defect/F1
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const skillFile = join(root, 'packages/kaal-defect/skills/kaal-defect/SKILL.md');
const checkFile = join(root, 'packages/kaal-defect/skills/kaal-defect/scripts/check-defects.mjs');
const skill = () => { assert.ok(existsSync(skillFile), 'the Skill packages/kaal-defect/skills/kaal-defect/SKILL.md is absent'); return readFileSync(skillFile, 'utf8'); };
export const id = 'defect/T1211';
export const tests = ['defect/F1'];
export const title = 'the Skill defines a Defect as a negative Requirement beside Intent and states the route';
export async function run() {
  const t = skill();
  assert.match(t, /negative Requirement/, 'a Defect is a negative Requirement');
  assert.match(t, /beside Intent/, 'its root sits beside Intent');
  assert.match(t, /Finding, then Test Case, then Defect, then a Change or a HOTFIX/, 'the route is stated');
  assert.match(t, /no Test Case proves[^\n]*not yet a Defect/, 'an unproven finding is not yet a Defect');
}
