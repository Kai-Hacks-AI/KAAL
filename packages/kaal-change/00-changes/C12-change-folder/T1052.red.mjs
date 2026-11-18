// Case change/T1052 tests: change/G4
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { PACKAGE } from '../../test/folder-control-support.mjs';
export const id = 'change/T1052';
export const tests = ['change/G4'];
export const title = 'gap change/G4 is closed: the Change Record Definition states closure, the change kinds C and G and that a Defect is enduring, and the Skill ships and points to the folder control';
export async function run() {
  const record = readFileSync(join(PACKAGE, 'capability/Change-Record.md'), 'utf8');
  assert.match(record, /act\.md/, 'the Change Record Definition does not state that a Change folder holds act.md when closed');
  assert.match(record, /change kinds[^.]*\bC\b[^.]*\bG\b/i, 'the Definition does not state the change kinds C and G');
  assert.doesNotMatch(record, /change kinds[^.]*\bD\b/i, 'the Definition counts a Defect among the change kinds');
  assert.match(record, /defect[^.]*enduring/i, 'the Definition does not say that a Defect is enduring');
  assert.ok(existsSync(join(PACKAGE, 'skills/kaal-change/scripts/folder-control.mjs')), 'the Skill ships no folder control');
  assert.match(readFileSync(join(PACKAGE, 'skills/kaal-change/SKILL.md'), 'utf8'), /folder-control/, 'the Skill does not point to the folder control');
}
test(id, () => run());
