// Case architecture/T18 tests: architecture/F1
import assert from 'node:assert/strict';
import { read, SKILL } from '../../test/lib.mjs';
export const id = 'architecture/T18';
export const tests = ['architecture/F1'];
export const title = "the Skill defines Solution and Delivery and gives the test that tells them apart";
export function run() {
  const s = read(SKILL, 'the Skill');
  assert.match(s, /\*\*Solution\*\* is what the intended solution is and must do/);
  assert.match(s, /\*\*Delivery\*\* is how that solution is realized, operated or made available/);
  assert.match(s, /would it still hold if the means that realize, operate or provide the solution were replaced by others/i);
}
