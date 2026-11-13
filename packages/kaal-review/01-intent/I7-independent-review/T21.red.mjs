// Case review/T21 tests: review/I7
import assert from 'node:assert/strict';
import { read, trial, REVIEW, section } from '../../00-changes/C1-architecture-classification-review/lib.mjs';
export const id = 'review/T21';
export const tests = ['review/I7'];
export const title = "the review record exists and ends with what the Owner decides and that it grants no authority";
export function run() {
  read(REVIEW, 'the review record');
  section('For the Owner');
  assert.match(section('No authority'), /grants no authority/i);
}
