// Case review/T25 tests: review/F23
import assert from 'node:assert/strict';
import { read, trial, REVIEW, section } from '../../00-changes/C1-architecture-classification-review/lib.mjs';
export const id = 'review/T25';
export const tests = ['review/F23'];
export const title = "the review states what it did not check, the reviewer's limits and each decision for the Owner with its options";
export function run() {
  section('Not checked');
  const l = section('Limits');
  for (const w of [/model/i, /no tool|tool/i, /human/i]) assert.match(l, w);
  const o = section('For the Owner');
  assert.ok((o.match(/^\s*(\d+\.|[-*]) /gm) || []).length >= 2, 'fewer than two Owner decisions are listed');
  assert.match(o, /option/i);
}
