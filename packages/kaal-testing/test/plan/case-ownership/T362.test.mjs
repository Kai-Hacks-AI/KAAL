// Case testing/T362 tests: testing/F137. It checks that an unresolved Case is investigated and left where it is, never what the investigation concludes.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { OUTCOMES, REPO, readSurvey, sha, surveyOnDisk } from './lib.mjs';
export const id = 'testing/T362';
export const tests = ['testing/F137'];
export const title = 'every unresolved Case has a recorded investigation, and no Case or its links were changed to resolve it';
export function run() {
  const s = surveyOnDisk();
  const open = s.cases.filter((c) => c.status === 'unresolved');
  const inv = readSurvey('investigations.json').investigations;
  assert.ok(Array.isArray(inv), 'investigations is a list');
  assert.deepEqual(inv.map((x) => x.case).sort(), open.map((c) => c.case).sort(), 'one investigation for each unresolved Case, and none for another');
  for (const x of inv) {
    assert.ok(OUTCOMES.includes(x.outcome), `${x.case}: outcome "${x.outcome}" is none of ${OUTCOMES.join(', ')}`);
    assert.ok(typeof x.ask === 'string' && x.ask.trim() !== '', `${x.case}: names whom to ask`);
    assert.ok(typeof x.reasoning === 'string' && x.reasoning.trim() !== '', `${x.case}: states its reasoning`);
  }
  for (const c of s.cases)
    assert.equal(sha(readFileSync(join(REPO, c.case), 'utf8')), c.fileSha256, `${c.case}: unchanged since the survey, so nothing was reassigned to resolve it`);
}
