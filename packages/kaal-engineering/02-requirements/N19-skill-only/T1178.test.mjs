// Case engineering/T1178 tests: engineering/N19
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const file = join(root, 'packages/kaal-engineering/skills/kaal-engineering/SKILL.md');
const skill = () => { assert.ok(existsSync(file), 'the Skill packages/kaal-engineering/skills/kaal-engineering/SKILL.md is absent'); return readFileSync(file, 'utf8'); };
export const id = 'engineering/T1178';
export const tests = ['engineering/N19'];
export const title = 'the Skill passes the checker of the Engineer Skill';
export async function run() {
  const dir = join(root, 'packages/kaal-engineering/skills/kaal-engineering');
  assert.ok(existsSync(dir), 'the Skill directory is absent');
  const r = spawnSync(process.execPath, [join(root, 'packages/kaal-engineer-skill/skills/kaal-engineer-skill/scripts/check-skill.mjs'), dir], { encoding: 'utf8' });
  assert.equal(r.status, 0, `check-skill found: ${r.stdout}${r.stderr}`);
}
