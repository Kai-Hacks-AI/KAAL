// Case testing/T392 tests: testing/F165, testing/N37. Structural placement and boundary only; prose quality is verified in testing/C76 and the C77 pilot.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SKILL_DIR = process.env.KAAL_TESTING_SKILL_DIR ? resolve(process.env.KAAL_TESTING_SKILL_DIR) : join(PKG, 'skills/kaal-testing');
const SKILL = join(SKILL_DIR, 'SKILL.md');

const EXPECTED_HEADINGS = [
  'Before writing a test',
  'Assessing a test against its claim',
  'Testing loops',
  'Running acceptance',
  'Measuring coverage',
  'Expected failures',
  'Reporting',
  'Rules',
];

const MARKER = '**Seeded property and adversarial testing.**';
const BEFORE_MARKER = '**Targeted Mutation Verification.**';
const AFTER_MARKER = '**Uncovered behaviour.**';

export const id = 'testing/T392';
export const tests = ['testing/F165', 'testing/N37'];
export const title = 'the Skill places Seeded property and adversarial testing inside Testing loops without adding headings or KAAL paths';

export function run() {
  assert.ok(existsSync(SKILL), `missing: ${SKILL}`);
  const text = readFileSync(SKILL, 'utf8');
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  assert.deepEqual(headings, EXPECTED_HEADINGS, 'top-level Skill headings stay unchanged');

  const start = text.search(/^## Testing loops\s*$/m);
  assert.ok(start >= 0, 'the Skill has no section "Testing loops"');
  const rest = text.slice(start);
  const next = rest.slice(3).search(/^## /m);
  const section = (next < 0 ? rest : rest.slice(0, next + 3)).trimEnd();

  const atBefore = section.indexOf(BEFORE_MARKER);
  const atMarker = section.indexOf(MARKER);
  const atAfter = section.indexOf(AFTER_MARKER);
  assert.ok(atMarker >= 0, `"Testing loops" does not contain "${MARKER}"`);
  assert.ok(atBefore >= 0 && atAfter >= 0, 'missing peer markers in "Testing loops"');
  assert.ok(
    atBefore < atMarker && atMarker < atAfter,
    `"${MARKER}" must stand after "${BEFORE_MARKER}" and before "${AFTER_MARKER}"`,
  );

  const badPath = section.match(/(\.kaal\/|engineering\/|packages\/)/);
  assert.equal(badPath, null, `section must stay consumer-agnostic (found "${badPath?.[0]}")`);
}
