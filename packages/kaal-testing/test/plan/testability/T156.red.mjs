// Case testing/T156 tests: testing/F129
import assert from 'node:assert/strict';
import { HEADING, OWNERS, skillParts } from './lib.mjs';
export const id = 'testing/T156';
export const tests = ['testing/F129'];
export const title = 'the Skill assesses a claim by deterministic test, then judgment, then pushback to a named owner';
export function run() {
  const { headings, section } = skillParts();
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  assert.ok(headings.indexOf(HEADING) === headings.indexOf('Before writing a test') + 1 && headings.indexOf(HEADING) < headings.indexOf('The three loops'), 'the section stands after "Before writing a test" and before "The three loops"');
  const at = ['**Deterministic.**', '**Judgment.**', '**Pushback.**'].map((m) => section.indexOf(m));
  assert.ok(at.every((i) => i >= 0) && at[0] < at[1] && at[1] < at[2], 'the three outcomes appear in order: Deterministic, Judgment, Pushback');
  for (const [i, words] of [[0, /observable/i], [0, /oracle/i], [1, /evidence|comparison|independent review/i], [1, /who judges/i]])
    assert.match(section.slice(at[i], at[i + 1] ?? undefined), words, `outcome ${i + 1} mentions ${words}`);
  for (const o of OWNERS) assert.ok(section.includes(o), `the section names the owner ${o}`);
  assert.ok(section.split(/\s+/).length <= 260, 'the section stays small: at most 260 words');
}
