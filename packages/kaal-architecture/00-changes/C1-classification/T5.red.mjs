// Case architecture/T5 tests: architecture/G1
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'architecture/T5';
export const tests = ['architecture/G1'];
export const title = "gap architecture/G1 is closed: the Skill is present";
export function run() {
  read(SKILL, 'the Skill');
}
