// Case architecture/T3 tests: architecture/F3
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../lib.mjs';
export const id = 'architecture/T3';
export const tests = ['architecture/F3'];
export const title = "a Skill-only agent splits a mixed statement, keeps a constraint with the concern it constrains and asks where it cannot tell";
export function run() {
  read('02-requirements/F3-mixed-and-ambiguous/F3.md', 'F3');
  judged(['S3', 'S4', 'S5', 'S8', 'S9']);
}
