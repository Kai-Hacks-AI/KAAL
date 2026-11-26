// Case defect/T1210 tests: defect/I1
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync as lsDir } from 'node:fs';
import { dirname as parentOf } from 'node:path';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-defect');
const skillFile = join(pkg, 'skills/kaal-defect/SKILL.md');
const script = join(pkg, 'skills/kaal-defect/scripts/known-defects.mjs');
const skill = () => { assert.ok(existsSync(skillFile), 'the Skill packages/kaal-defect/skills/kaal-defect/SKILL.md is absent'); const refs = join(parentOf(skillFile), 'references'); return [skillFile, ...(existsSync(refs) ? lsDir(refs).sort().map((f) => join(refs, f)) : [])].map((f) => readFileSync(f, 'utf8')).join('\n'); }; // the Skill is SKILL.md and its references/
export const id = 'defect/T1210';
export const tests = ['defect/I1'];

export const title = 'the Skill is named kaal-defect, says a Defect is a passive description whose state is derived from the Test Cases that point at it, and that this is not permission to merge';
export async function run() {
  const t = skill();
  assert.match(t, /^name: kaal-defect$/m, 'the Skill is named kaal-defect');
  assert.match(t, /passive description of an undesirable condition/, 'a Defect is a passive description');
  assert.match(t, /no known, fixed or open state of its own/, 'a Defect holds no state');
  assert.match(t, /its state is derived from the Test Cases that point at it/, 'state is derived from the Cases');
  assert.match(t, /not permission to merge/, 'evidence is not permission to merge');
  assert.match(t, /does not select a CARE treatment \(Contain, Accept, Ratchet, Eliminate\) or authorize a release/, 'Defect reports evidence and selects no treatment');
  assert.match(t, /A validated Finding stays a Finding/, 'a Finding is not automatically a Defect');
}
