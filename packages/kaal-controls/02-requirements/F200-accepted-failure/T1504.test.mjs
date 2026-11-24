// Case controls/T1504 tests: controls/F200
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/accept.mjs');
const acc = (control, testCase, over = {}) => ({ control, testCase, defect: 'D1', owner: 'o', reason: 'because', ...over });
export const id = 'controls/T1504';
export const tests = ['controls/F200'];
export const title = 'a voided acceptance covers nothing when its Test Case fails again, stays visible as unused, and a new acceptance with its own Defect covers the failure again';
export async function run() {
  assert.ok(existsSync(lib), 'scripts/accept.mjs is absent');
  const { judgeAcceptance } = await import(pathToFileURL(lib).href);
  const failing = [{ control: 'c2', status: 'FAIL', failing: ['t1'] }];
  const voided = acc('c2', 't1', { voided: true });
  const back = judgeAcceptance({ results: failing, acceptances: [voided] });
  assert.equal(back.verdict, 'BLOCK', 'a regression inherited a voided acceptance');
  assert.deepEqual(back.report[0], { control: 'c2', status: 'FAIL', accepted: false, uncovered: ['t1'] });
  assert.deepEqual(back.unused, [voided], 'a voided acceptance was not kept visible');
  const clean = judgeAcceptance({ results: [{ control: 'c2', status: 'PASS', failing: [] }], acceptances: [voided] });
  assert.equal(clean.verdict, 'PERMIT', 'a voided acceptance blocked a passing control');
  assert.deepEqual(clean.unused, [voided]);
  const renewed = acc('c2', 't1', { defect: 'D2' });
  const again = judgeAcceptance({ results: failing, acceptances: [voided, renewed] });
  assert.equal(again.verdict, 'PERMIT', 'a new acceptance with its own Defect did not cover the failure');
  assert.deepEqual(again.unused, [voided]);
}
