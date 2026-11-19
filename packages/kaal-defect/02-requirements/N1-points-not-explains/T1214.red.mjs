// Case defect/T1214 tests: defect/N1
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
export const id = 'defect/T1214';
export const tests = ['defect/N1'];
export const title = 'the Skill points to the owners of the Test Case, the HOTFIX and the Requirement and gives none a section of its own';
export async function run() {
  const t = skill();
  for (const owner of ['kaal-testing', 'kaal-release', 'kaal-requirements']) assert.ok(t.includes(`see ${owner}`), `the Skill does not point to ${owner}`);
  assert.ok(!/^#+\s.*(Test Case|HOTFIX|Requirement)/m.test(t), 'an owned term has a section of its own');
}
