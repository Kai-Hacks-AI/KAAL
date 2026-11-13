// Case transition/T6 tests: transition/G2
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../00-changes/C1-transition/lib.mjs';
export const id = 'transition/T6';
export const tests = ['transition/G2'];
export const title = "gap transition/G2 is closed: an independent Skill-only trial and a no-Skill baseline are recorded with provenance";
export function run() {
  const { meta } = trial('skill'); trial('baseline');
  for (const s of key()) assert.ok(meta.answers.some((a) => a.id === s.id), `the trial has no answer for ${s.id}`);
}
