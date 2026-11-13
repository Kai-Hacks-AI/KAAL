// Case change/T64 tests: change/A25, change/F52
import test from 'node:test';
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, REF, trial, FIELDS } from '../../../00-changes/C10-transition/lib.mjs';
export const id = 'change/T64';
export const tests = ['change/A25', 'change/F52'];
export const title = "the reference teaches the five questions and four kinds, the Skill points to it, nothing names another package, and the observer finds history kept apart from the target";
export function run() {
  const skill = read(REF, 'the reference');
  assert.ok(read(SKILL, 'the Skill').includes('references/transition.md'), 'the Skill does not point to the reference');
  for (const w of ['historical', 'enduring', 'target', 'transition', 'superseded']) assert.ok(skill.includes(w), `the reference lacks "${w}"`);
  assert.ok(!/kaal-architecture|DEFAULT|C12|C14/.test(skill), 'the reference names another package or a protected Change');
  const { meta } = trial('skill');
  assert.equal(meta.observerVerdict?.historicalKeptApartFromTarget, true, 'the observer does not find historical and target truth kept apart');
}
test(id, () => run());
