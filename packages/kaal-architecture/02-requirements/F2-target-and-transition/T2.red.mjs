// Case architecture/T2 tests: architecture/F2
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'architecture/T2';
export const tests = ['architecture/F2'];
export const title = "a Skill-only agent flags a transition statement and splits it from the target";
export function run() {
  read('02-requirements/F2-target-and-transition/F2.md', 'F2');
  judged(['S3', 'S8', 'S4', 'S9']);
}
