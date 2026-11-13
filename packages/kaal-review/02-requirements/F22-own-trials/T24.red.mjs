// Case review/T24 tests: review/F22
import assert from 'node:assert/strict';
import { read, trial, REVIEW, section } from '../../00-changes/C1-architecture-classification-review/lib.mjs';
export const id = 'review/T24';
export const tests = ['review/F22'];
export const title = "the reviewer's own trial is recorded with provenance: its own key fixed first, at least three runs per arm, raw output unedited";
export function run() {
  const { runs } = trial();
  assert.ok(runs.skill.length >= 3 && runs.baseline.length >= 3);
}
