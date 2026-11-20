// Case defect/T1210 tests: defect/I1
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-defect');
const skillFile = join(pkg, 'skills/kaal-defect/SKILL.md');
const script = join(pkg, 'skills/kaal-defect/scripts/known-defects.mjs');
const skill = () => { assert.ok(existsSync(skillFile), 'the Skill packages/kaal-defect/skills/kaal-defect/SKILL.md is absent'); return readFileSync(skillFile, 'utf8'); };
export const id = 'defect/T1210';
export const tests = ['defect/I1'];
export const title = 'the Skill is named kaal-defect and says a known Defect is listed as a proven known failure, that a verdict is not permission to merge, and that a fixed one is out of date';
export async function run() {
  const t = skill();
  assert.match(t, /^name: kaal-defect$/m, 'the Skill is named kaal-defect');
  assert.match(t, /known/i, 'it speaks of known Defects');
  assert.match(t, /registered and `pass`: `fixed`, so the entry is out of date/, 'a fixed Defect is out of date');
  assert.match(t, /not permission to merge/, 'a verdict is not permission to merge');
}
