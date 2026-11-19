// Case defect/T1212 tests: defect/F2
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
export const id = 'defect/T1212';
export const tests = ['defect/F2'];
export const title = 'the Skill gives the identity <capability>/D<n> per capability and keeps the record with its context';
export async function run() {
  const t = skill();
  assert.ok(t.includes('<capability>/D<n>'), 'the identity is <capability>/D<n>');
  assert.match(t, /counted per capability/, 'ids are counted per capability');
  assert.match(t, /record stays with the context that raised it/, 'the record stays with its context');
}
