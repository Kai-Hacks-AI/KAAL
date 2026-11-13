// Case review/T21 tests: review/I7
import assert from 'node:assert/strict';
import { each, section, trial } from '../../00-changes/C1-skill-trial-review/lib.mjs';
export const id = 'review/T21';
export const tests = ['review/I7'];
export const title = "each application has a review record that ends with what the Owner decides and that it grants no authority";
export function run() {
  each((app) => {
    app.review();
    section(app, 'For the Owner');
    assert.match(section(app, 'No authority'), /grants no authority/i);
  });
}
