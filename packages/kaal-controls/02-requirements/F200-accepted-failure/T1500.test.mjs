// Case controls/T1500 tests: controls/F200
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const skill = join(repo, 'packages/kaal-controls/skills/kaal-controls');
const lib = join(skill, 'scripts/accept.mjs');
const acc = (control, testCase, over = {}) => ({ control, testCase, defect: 'D1', owner: 'o', reason: 'because', ...over });
export const id = 'controls/T1500';
export const tests = ['controls/F200'];
export const title = 'an accepted failing control stays FAIL in the report and is flagged ACCEPTED, delivery is permitted for it, and nothing is written or changed';
export async function run() {
  assert.ok(existsSync(lib), 'scripts/accept.mjs is absent');
  const { judgeAcceptance } = await import(pathToFileURL(lib).href);
  const results = [{ control: 'c1', status: 'PASS', failing: [] }, { control: 'c2', status: 'FAIL', failing: ['t1', 't2'] }];
  const acceptances = [acc('c2', 't1'), acc('c2', 't2')];
  const a = judgeAcceptance({ results, acceptances });
  assert.equal(a.verdict, 'PERMIT');
  assert.deepEqual(a.report, [{ control: 'c1', status: 'PASS', accepted: false, uncovered: [] }, { control: 'c2', status: 'FAIL', accepted: true, uncovered: [] }], 'an accepted failure must stay FAIL and be flagged accepted');
  assert.deepEqual(Object.keys(a).sort(), ['reasons', 'report', 'unused', 'verdict']);
  assert.deepEqual(a.unused, []);
  const before = JSON.stringify({ results, acceptances });
  judgeAcceptance({ results, acceptances });
  assert.equal(JSON.stringify({ results, acceptances }), before, 'an input was changed');
  assert.equal(judgeAcceptance({ results: [{ control: 'c1', status: 'PASS', failing: [] }], acceptances: [] }).verdict, 'PERMIT');
}
