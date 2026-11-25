// Case architecture/T7 tests: architecture/G1
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from './lib.mjs';
export const id = 'architecture/T7';
export const tests = ['architecture/G1'];
export const title = "gap architecture/G1 is closed: the Skill is present";
export function run() {
  read(SKILL, 'the Skill');
}
