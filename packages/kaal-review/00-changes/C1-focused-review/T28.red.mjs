// Case review/T28 tests: review/G1
import assert from 'node:assert/strict';
import { each, section, findings, FOCI } from './lib.mjs';
export const id = 'review/T28';
export const tests = ['review/G1'];
export const title = "gap review/G1 is closed: a review is recorded as the comparison of a reference with an actual under a focus";
export function run() {
  each((app) => {
    assert.ok(app.review().length > 1000, `${app.name}: the review record is a stub`);
  });
}
