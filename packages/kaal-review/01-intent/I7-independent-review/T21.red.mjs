// Case review/T21 tests: review/I7
import assert from 'node:assert/strict';
import { each, section, findings, FOCI } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T21';
export const tests = ['review/I7'];
export const title = "each application compares a reference with an actual and ends with what the Owner decides and that it grants no authority";
export function run() {
  each((app) => {
    app.review();
    section(app, 'Comparison');
    section(app, 'For the Owner');
    assert.match(section(app, 'No authority'), /grants no authority/i);
  });
}
