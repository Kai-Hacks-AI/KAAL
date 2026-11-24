// Case controls/T1502 tests: controls/F200
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const skill = join(repo, 'packages/kaal-controls/skills/kaal-controls');
const lib = join(skill, 'scripts/accept.mjs');
const acc = (control, testCase, over = {}) => ({ control, testCase, defect: 'D1', owner: 'o', reason: 'because', ...over });
export const id = 'controls/T1502';
export const tests = ['controls/F200'];
export const title = 'an acceptance missing a Defect, owner or reason covers nothing, one that matches no failure is listed unused and does not block, and a missing list is UNKNOWN';
export async function run() {
  assert.ok(existsSync(lib), 'scripts/accept.mjs is absent');
  const { judgeAcceptance } = await import(pathToFileURL(lib).href);
  const j = (results, acceptances) => judgeAcceptance({ results, acceptances });
  const failing = [{ control: 'c2', status: 'FAIL', failing: ['t1'] }];
  for (const field of ['defect', 'owner', 'reason']) {
    const a = j(failing, [acc('c2', 't1', { [field]: '' })]);
    assert.equal(a.verdict, 'BLOCK', 'an acceptance without ' + field + ' covered a failure');
    assert.deepEqual(a.reasons.map((r) => r.kind), ['bad-acceptance'], 'a bad acceptance was not named for ' + field);
  }
  const unused = j([{ control: 'c1', status: 'PASS', failing: [] }], [acc('c2', 't1')]);
  assert.equal(unused.verdict, 'PERMIT', 'an unused acceptance blocked delivery');
  assert.deepEqual(unused.unused, [acc('c2', 't1')]);
  assert.equal(judgeAcceptance({ acceptances: [] }).verdict, 'UNKNOWN');
  assert.equal(judgeAcceptance({ results: [] }).verdict, 'UNKNOWN');
}
