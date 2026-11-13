// Case transition/T5 tests: transition/G1
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../00-changes/C1-transition/lib.mjs';
export const id = 'transition/T5';
export const tests = ['transition/G1'];
export const title = "gap transition/G1 is closed: the Skill is present";
export function run() {
  read(SKILL, 'the Skill');
}
