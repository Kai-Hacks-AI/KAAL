// Case review/T27 tests: review/A1
import assert from 'node:assert/strict';
import { read, trial, REVIEW, section } from '../../00-changes/C1-architecture-classification-review/lib.mjs';
export const id = 'review/T27';
export const tests = ['review/A1'];
export const title = "the record has the chapters of A1 and a trial folder next to it";
export function run() {
  const md = read(REVIEW, 'the review record');
  for (const h of ['Inspected', 'Findings', 'Skill versus baseline', 'Not checked', 'Limits', 'For the Owner', 'No authority']) assert.match(md, new RegExp(`^## ${h}\\s*$`, 'm'), `chapter ${h} is absent`);
  read('00-changes/C1-architecture-classification-review/trial/key.json', 'the reviewer key');
}
