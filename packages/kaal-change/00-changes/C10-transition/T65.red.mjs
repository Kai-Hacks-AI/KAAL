// Case change/T65 tests: change/G1
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../00-changes/C10-transition/lib.mjs';
export const id = 'change/T65';
export const tests = ['change/G1'];
export const title = "gap change/G1 is closed: the Skill is present";
export function run() {
  read(SKILL, 'the Skill');
}
