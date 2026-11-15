// Case change/T61 tests: change/I24, change/F50, change/F51
import test from 'node:test';
import assert from 'node:assert/strict';
import { dir, judged, judgedDecompositions, key, read, SKILL, trial, FIELDS } from '../../00-changes/C10-transition/lib.mjs';
export const id = 'change/T61';
export const tests = ['change/I24', 'change/F50', 'change/F51'];
export const title = "a Skill-only agent labels each expectation's kind of truth and finding as the key does, and answers the five questions and decomposes only where it should";
export function run() {
  read('01-intent/I24-transition/I24.md', 'I24');
  judged(key().map((s) => s.id));
  judgedDecompositions();
  const { meta } = trial('skill');
  for (const f of FIELDS) assert.ok(meta.explanation[f], `the explanation lacks ${f}`);
}
test(id, () => run());
