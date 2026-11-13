// Case review/T24 tests: review/F22
import assert from 'node:assert/strict';
import { each, section, trial } from '../../00-changes/C1-skill-trial-review/lib.mjs';
export const id = 'review/T24';
export const tests = ['review/F22'];
export const title = "the reviewer's own trial is recorded with provenance: its own key fixed first, at least three runs per arm, raw output unedited";
export function run() {
  each((app) => {
    trial(app);
  });
}
