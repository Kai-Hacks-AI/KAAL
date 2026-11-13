// Case change/T66 tests: change/G2
import test from 'node:test';
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../00-changes/C10-transition/lib.mjs';
export const id = 'change/T66';
export const tests = ['change/G2'];
export const title = "gap change/G2 is closed: an independent Skill-only trial and a no-Skill baseline are recorded with provenance";
export function run() {
  const { meta } = trial('skill'); trial('baseline');
  for (const s of key()) assert.ok(meta.answers.some((a) => a.id === s.id), `the trial has no answer for ${s.id}`);
}
test(id, () => run());
