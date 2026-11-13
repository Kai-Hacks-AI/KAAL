// Case review/T23 tests: review/F21
import assert from 'node:assert/strict';
import { read, trial, REVIEW, section } from '../../00-changes/C1-architecture-classification-review/lib.mjs';
export const id = 'review/T23';
export const tests = ['review/F21'];
export const title = "the review answers whether S4 needs ambiguous, what the baseline comparison establishes and how independent the key is";
export function run() {
  const f = section('Findings') + section('Skill versus baseline');
  assert.match(f, /S4/); assert.match(f, /ambiguous/i); assert.match(f, /next move|\bask\b/i);
  assert.match(section('Skill versus baseline'), /nine of ten|9 of 10|9\/10/i);
  assert.match(f, /S10/); assert.match(f, /after (being )?seen|corrected/i);
}
