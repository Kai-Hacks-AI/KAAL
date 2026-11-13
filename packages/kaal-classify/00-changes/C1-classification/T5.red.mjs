// Case classify/T5 tests: classify/G1
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'classify/T5';
export const tests = ['classify/G1'];
export const title = "gap classify/G1 is closed: the Skill is present";
export function run() {
  read(SKILL, 'the Skill');
}
