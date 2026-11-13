// Case architecture/T6 tests: architecture/A2
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../../00-changes/C1-classification/lib.mjs';
export const id = 'architecture/T6';
export const tests = ['architecture/A2'];
export const title = "the Skill is named kaal-architecture and states the two concerns and the two semantics";
export function run() {
  const skill = read(SKILL, 'the Skill');
  assert.match(skill, /^---\nname: kaal-architecture\n/);
  for (const w of ['Solution', 'Delivery', 'target-state', 'transition']) assert.ok(skill.includes(w), `the Skill never says ${w}`);
}
