// Case release/T682 tests: release/C51
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { REAL, table } from './fixtures.mjs';
export const id = 'release/T682';
export const tests = ['release/C51'];
export const title = 'the rows of the WIRE template say what this type of pull request needs: each named word is in the Action of its row, and every Action is one short line';
const MUST = [
  [0, 'on main'],
  [0, 'Source'],
  [1, 'wire/'],
  [1, 'draft PR'],
  [2, 'byte for byte'],
  [2, 'never develops'],
  [3, 'Source is on main'],
  [3, 'Case is green'],
  [4, 'ruleset'],
  [4, 'beside the old'],
  [4, 'nothing starts automatically'],
];
export async function run() {
  assert.ok(existsSync(REAL), 'wire.md is absent from 05-src/wiring/templates');
  const body = table(readFileSync(REAL, 'utf8')).slice(2);
  for (const [step, word] of MUST) assert.ok(body[step]?.[2]?.includes(word), `step ${step} does not name ${word}`);
  for (const r of body) assert.ok(r[2].length > 0 && r[2].length <= 160 && !r[2].includes('\n'), `the Action of step ${r[0]} is not one short line`);
  assert.deepEqual([body[0][3], body.at(-1)[3]], ['pending', 'pending'], 'a border row does not start pending');
  assert.deepEqual([body[1][3], body[2][3], body[3][3]], ['open', 'open', 'open'], 'a Worker or Reviewer row does not start open');
}
