// Case transition/T1 tests: transition/I1, transition/F1, transition/F2
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../00-changes/C1-transition/lib.mjs';
export const id = 'transition/T1';
export const tests = ['transition/I1', 'transition/F1', 'transition/F2'];
export const title = "a Skill-only agent labels each expectation's kind of truth and finding as the key does, and answers the five questions";
export function run() {
  read('01-intent/I1-transition/I1.md', 'I1');
  judged(key().map((s) => s.id));
  const { meta } = trial('skill');
  for (const f of FIELDS) assert.ok(meta.explanation[f], `the explanation lacks ${f}`);
}
