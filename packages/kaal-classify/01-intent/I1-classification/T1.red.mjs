// Case classify/T1 tests: classify/I1, classify/F1, classify/F2
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'classify/T1';
export const tests = ['classify/I1', 'classify/F1', 'classify/F2'];
export const title = "a Skill-only agent splits, moves and challenges statements as the key does";
export function run() {
  read('01-intent/I1-classification/I1.md', 'I1');
  judged(['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S8', 'S10']);
}
