// Case review/T26 tests: review/N4
import assert from 'node:assert/strict';
import { read, trial, REVIEW, section } from '../../00-changes/C1-architecture-classification-review/lib.mjs';
export const id = 'review/T26';
export const tests = ['review/N4'];
export const title = "the review records that it changed nothing in Architecture and weakened no Case or key, and it approves nothing";
export function run() {
  const n = section('No authority');
  assert.match(n, /packages\/kaal-architecture/); assert.match(n, /changed nothing|no change/i);
  assert.doesNotMatch(read(REVIEW, 'the review record'), /^\s*(Verdict|Decision):\s*(approve|merge)/im);
}
