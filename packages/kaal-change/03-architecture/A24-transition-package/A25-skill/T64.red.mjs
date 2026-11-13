// Case change/T64 tests: change/A25, change/F52
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../../00-changes/C10-transition/lib.mjs';
export const id = 'change/T64';
export const tests = ['change/A25', 'change/F52'];
export const title = "the Skill teaches the five questions and four kinds, names no other package, and the observer finds history kept apart from the target";
export function run() {
  const skill = read(SKILL, 'the Skill');
  for (const w of ['historical', 'enduring', 'target', 'transition', 'superseded']) assert.ok(skill.includes(w), `the Skill lacks "${w}"`);
  assert.ok(!/kaal-architecture|DEFAULT|C12|C14/.test(skill), 'the Skill or package names another package or a protected Change');
  const { meta } = trial('skill');
  assert.equal(meta.observerVerdict?.historicalKeptApartFromTarget, true, 'the observer does not find historical and target truth kept apart');
}
