// Case defect/T1210 tests: defect/I1
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
export const id = 'defect/T1210';
export const tests = ['defect/I1'];
export const title = 'the Skill is named kaal-defect and says it defines the Defect';
export async function run() {
  const t = skill();
  assert.match(t, /^name: kaal-defect$/m, 'the Skill is named kaal-defect');
  assert.match(t, /^description: .*Defect/m, 'the description says it is about the Defect');
}
