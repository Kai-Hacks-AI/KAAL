// Case architecture/T16 tests: architecture/A2
import assert from 'node:assert/strict';
import { read, SKILL } from '../../../test/lib.mjs';
export const id = 'architecture/T16';
export const tests = ['architecture/A2'];
export const title = "the Skill is named kaal-architecture and states the two concerns and the plateau";
export function run() {
  const skill = read(SKILL, 'the Skill');
  assert.match(skill, /^---\nname: kaal-architecture\n/);
  for (const w of ['Solution', 'Delivery', 'plateau']) assert.ok(skill.includes(w), `the Skill never says ${w}`);
}
