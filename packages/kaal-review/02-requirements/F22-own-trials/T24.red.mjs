// Case review/T24 tests: review/F22
import assert from 'node:assert/strict';
import { each, section, trial, FOCI } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T24';
export const tests = ['review/F22'];
export const title = "where the evidence is a trial, the reviewer's own trial is recorded with provenance: its own key fixed first, at least three runs per arm, raw output unedited";
export function run() {
  each((app) => {
    if (app.subject.trial) trial(app);
    else assert.match(section(app, 'Evidence'), /no trial/i);
  });
}
