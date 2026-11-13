// Case testing/T157 tests: testing/F130, testing/F133, testing/N28. It checks that the rules are present and labelled, never their wording.
import assert from 'node:assert/strict';
import { HEADING, skillParts } from './lib.mjs';
export const id = 'testing/T157';
export const tests = ['testing/F130', 'testing/F133', 'testing/N28'];
export const title = 'the section carries two labelled rules after the outcomes: reject a brittle Case, and never invent an oracle';
export function run() {
  const { section } = skillParts();
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  const last = section.indexOf('**Point at judgement.**');
  assert.ok(last >= 0, 'the outcomes are present');
  for (const label of ['**Reject a brittle Case.**', '**Never invent.**']) {
    const at = section.indexOf(label);
    assert.ok(at > last, `${label} follows the outcomes`);
    const body = section.slice(at + label.length).split(/\n\s*\n/)[0].trim();
    assert.ok(body.split(/\s+/).length >= 12, `${label} is followed by its rule, not left empty`);
  }
}
