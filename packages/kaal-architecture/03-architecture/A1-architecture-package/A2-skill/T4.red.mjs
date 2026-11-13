// Case architecture/T4 tests: architecture/A2, architecture/F3
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../../00-changes/C1-classification/lib.mjs';
export const id = 'architecture/T4';
export const tests = ['architecture/A2', 'architecture/F3'];
export const title = "the Skill states the questions, the three concerns, the two semantics and the invariant, and a Skill-only agent keeps a weakening and a dependency apart";
export function run() {
  const skill = read(SKILL, 'the Skill');
  assert.match(skill, /^---\nname: kaal-architecture\n/);
  for (const w of ['Solution', 'Delivery', 'Change', 'target-state', 'change-oriented']) assert.ok(skill.includes(w), `the Skill never says ${w}`);
  assert.match(skill, /Delivery[^.]*(weaken|redefine)/i, 'the Skill does not state the invariant');
  judged(['S7', 'S9']);
}
