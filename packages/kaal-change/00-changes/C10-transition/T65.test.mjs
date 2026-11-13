// Case change/T65 tests: change/G1
import test from 'node:test';
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, REF, trial, FIELDS } from '../../00-changes/C10-transition/lib.mjs';
export const id = 'change/T65';
export const tests = ['change/G1'];
export const title = "gap change/G1 is closed: the reference is present and the Skill points to it";
export function run() {
  read(REF, 'the reference');
  assert.ok(read(SKILL, 'the Skill').includes('references/transition.md'), 'the Skill does not point to the reference');
}
test(id, () => run());
