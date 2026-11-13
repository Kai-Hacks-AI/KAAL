// Case architecture/T3 tests: architecture/F3
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'architecture/T3';
export const tests = ['architecture/F3'];
export const title = "a Skill-only agent splits a mixed statement, reclassifies a disguised one and does not guess an ambiguous one";
export function run() {
  read('02-requirements/F3-mixed-and-ambiguous/F3.md', 'F3');
  judged(['S5', 'S6', 'S10']);
}
