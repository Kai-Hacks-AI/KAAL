// Case architecture/T1 tests: architecture/I1, architecture/F1
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from './lib.mjs';
export const id = 'architecture/T1';
export const tests = ['architecture/I1', 'architecture/F1'];
export const title = "a Skill-only agent tells what the solution must do from how it is realized, as the key does";
export function run() {
  read('01-intent/I1-classification/I1.md', 'I1');
  judged(['S1', 'S2', 'S6', 'S7', 'S10']);
}
