// Case controls/T1505 tests: controls/F200
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/accept.mjs');
export const id = 'controls/T1505';
export const tests = ['controls/F200'];
export const title = 'delivery is permitted only when every result is PASS or an accepted FAIL, so a result with a missing, unrecognized or misspelled status, or one that is not a record, blocks';
export async function run() {
  assert.ok(existsSync(lib), 'scripts/accept.mjs is absent');
  const { judgeAcceptance } = await import(pathToFileURL(lib).href);
  const pass = { control: 'c1', status: 'PASS', failing: [] };
  assert.equal(judgeAcceptance({ results: [pass], acceptances: [] }).verdict, 'PERMIT');
  for (const [name, bad] of [
    ['a missing status', { control: 'c2', failing: [] }],
    ['an unrecognized status', { control: 'c2', status: 'OK', failing: [] }],
    ['a lower-case status', { control: 'c2', status: 'pass', failing: [] }],
    ['a status of another kind', { control: 'c2', status: 7, failing: [] }],
    ['a result that is not a record', null],
    ['a result that is a string', 'PASS'],
  ]) {
    const a = judgeAcceptance({ results: [pass, bad], acceptances: [] });
    assert.equal(a.verdict, 'BLOCK', name + ' was permitted');
    assert.equal(a.report.length, 2, name + ' was dropped from the report');
    assert.equal(a.report[1].accepted, false, name + ' was flagged accepted');
  }
  const accepted = [{ control: 'c2', testCase: 't1', defect: 'D1', owner: 'o', reason: 'because' }];
  const mixed = judgeAcceptance({ results: [{ control: 'c2', status: 'FAIL', failing: ['t1'] }, { control: 'c3', failing: [] }], acceptances: accepted });
  assert.equal(mixed.verdict, 'BLOCK', 'an accepted failure let an unrecognized status through');
}
