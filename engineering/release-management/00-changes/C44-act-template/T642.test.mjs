// Case release/T642 tests: release/C44
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { REAL, table } from './fixtures.mjs';
export const id = 'release/T642';
export const tests = ['release/C44'];
export const title = 'the rows of the ACT template say what this type of pull request needs: each named word is in the Action of its row, and every Action is one short line';
const MUST = [
  [0, 'The DO has merged'],
  [1, 'Create the ACT branch'],
  [1, 'draft PR'],
  [2, '4L'],
  [3, 'approve the ACT records'],
  [4, 'Merge the approved ACT'],
  [4, 'which requires'],
  [4, 'starts nothing'],
];
export async function run() {
  assert.ok(existsSync(REAL), 'act.md is absent from 05-src/wiring/templates');
  const body = table(readFileSync(REAL, 'utf8')).slice(2);
  for (const [step, word] of MUST) assert.ok(body[step]?.[2]?.includes(word), `step ${step} does not name ${word}`);
  for (const r of body) assert.ok(r[2].length > 0 && r[2].length <= 160 && !r[2].includes('\n'), `the Action of step ${r[0]} is not one short line`);
  assert.deepEqual([body[0][3], body.at(-1)[3]], ['pending', 'pending'], 'a border row does not start pending');
  assert.deepEqual([body[1][3], body[2][3], body[3][3]], ['open', 'open', 'open'], 'a Worker or Reviewer row does not start open');
}
