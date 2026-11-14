// Case architecture/T19 tests: architecture/F3
import assert from 'node:assert/strict';
import { read, SKILL } from '../../test/lib.mjs';
export const id = 'architecture/T19';
export const tests = ['architecture/F3'];
export const title = "the Skill splits a mixed statement, keeps a constraint with the concern it constrains and asks where it cannot tell";
export function run() {
  const s = read(SKILL, 'the Skill');
  assert.match(s, /\*\*Mixed\.\*\*[^\n]*split it into one statement for each/);
  assert.match(s, /\*\*Constraint across the line\.\*\*[^\n]*belongs to the concern it actually constrains/);
  assert.match(s, /\*\*Ambiguous\.\*\*[^\n]*put the question to the author/);
  assert.match(s, /ask rather than force a classification/);
}
