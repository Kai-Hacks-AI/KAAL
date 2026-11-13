// Case transition/T4 tests: transition/A2, transition/F3
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../../00-changes/C1-transition/lib.mjs';
export const id = 'transition/T4';
export const tests = ['transition/A2', 'transition/F3'];
export const title = "the Skill teaches the five questions and four kinds, names no other package, and the observer finds history kept apart from the target";
export function run() {
  const skill = read(SKILL, 'the Skill');
  for (const w of ['historical', 'enduring', 'target', 'transition', 'superseded']) assert.ok(skill.includes(w), `the Skill lacks "${w}"`);
  assert.ok(!/kaal-architecture|kaal-change|DEFAULT|C12|C14/.test(skill + read('package.json', 'package.json')), 'the Skill or package names another package or a protected Change');
  const { meta } = trial('skill');
  assert.equal(meta.observerVerdict?.historicalKeptApartFromTarget, true, 'the observer does not find historical and target truth kept apart');
}
