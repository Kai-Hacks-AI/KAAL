// Case testing/T156 tests: testing/F129, testing/N28. It checks structure only, never a sentence of the Skill.
import assert from 'node:assert/strict';
import { HEADING, OWNERS, skillParts } from './lib.mjs';
export const id = 'testing/T156';
export const tests = ['testing/F129', 'testing/N28'];
export const title = 'the Skill has one assessment section, with the outcomes Verify, Challenge and Point at judgement in order, the four owners, and no other Skill named';
export function run() {
  const { headings, section } = skillParts();
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  assert.ok(headings.indexOf(HEADING) === headings.indexOf('Before writing a test') + 1 && headings.indexOf(HEADING) < headings.indexOf('The three loops'), 'the section stands after "Before writing a test" and before "The three loops"');
  const at = ['**Verify.**', '**Challenge.**', '**Point at judgement.**'].map((m) => section.indexOf(m));
  assert.ok(at.every((i) => i >= 0) && at[0] < at[1] && at[1] < at[2], 'the three outcomes are labelled and in order: Verify, Challenge, Point at judgement');
  for (const o of OWNERS) assert.ok(section.includes(o), `the section names the owner ${o}`);
  assert.doesNotMatch(section, /kaal-review|\bReview\b/, 'the section names no other Skill');
  assert.ok(section.split(/\s+/).length <= 320, 'the section stays small: at most 320 words');
}
