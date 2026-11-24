// Case controls/T1501 tests: controls/F200
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const skill = join(repo, 'packages/kaal-controls/skills/kaal-controls');
const lib = join(skill, 'scripts/accept.mjs');
const acc = (control, testCase, over = {}) => ({ control, testCase, defect: 'D1', owner: 'o', reason: 'because', ...over });
export const id = 'controls/T1501';
export const tests = ['controls/F200'];
export const title = 'a new or different failure never inherits an acceptance: another Test Case, another control, a partial cover, a failure with no Test Case, and an UNKNOWN result each block delivery';
export async function run() {
  assert.ok(existsSync(lib), 'scripts/accept.mjs is absent');
  const { judgeAcceptance } = await import(pathToFileURL(lib).href);
  const j = (results, acceptances) => judgeAcceptance({ results, acceptances });
  const accepted = [acc('c2', 't1')];
  const other = j([{ control: 'c2', status: 'FAIL', failing: ['t9'] }], accepted);
  assert.equal(other.verdict, 'BLOCK', 'a different Test Case inherited the acceptance');
  assert.deepEqual(other.report[0], { control: 'c2', status: 'FAIL', accepted: false, uncovered: ['t9'] });
  assert.equal(j([{ control: 'c3', status: 'FAIL', failing: ['t1'] }], accepted).verdict, 'BLOCK', 'another control inherited the acceptance');
  const partial = j([{ control: 'c2', status: 'FAIL', failing: ['t1', 't9'] }], accepted);
  assert.equal(partial.verdict, 'BLOCK', 'a partial cover was taken as accepted');
  assert.deepEqual(partial.report[0], { control: 'c2', status: 'FAIL', accepted: false, uncovered: ['t9'] });
  assert.equal(j([{ control: 'c2', status: 'FAIL', failing: [] }], accepted).verdict, 'BLOCK', 'a failure with no cited Test Case was accepted');
  assert.equal(j([{ control: 'c2', status: 'UNKNOWN', failing: [] }], accepted).verdict, 'BLOCK', 'an UNKNOWN result was permitted');
  assert.equal(j([{ control: 'c2', status: 'UNKNOWN', failing: [] }], accepted).report[0].status, 'UNKNOWN');
}
