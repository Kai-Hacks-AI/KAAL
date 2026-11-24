// Case release/T662 tests: release/C46
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { REAL, table } from './fixtures.mjs';
export const id = 'release/T662';
export const tests = ['release/C46'];
export const title = 'the rows of the PROMOTION template say what this type of pull request needs: each named word is in the Action of its row, and every Action is one short line';
const MUST = [
  [0, 'Main requires'],
  [0, 'source branch'],
  [0, 'branch quality'],
  [0, 'single-promotion seat'],
  [1, "main's tip"],
  [1, 'omit'],
  [2, 'draft PROMOTION PR'],
  [2, 'exact head'],
  [3, 'exact head'],
  [4, 'into main, which requires'],
  [4, 'releases the seat'],
  [4, 'nothing starts automatically'],
];
export async function run() {
  assert.ok(existsSync(REAL), 'promotion.md is absent from 05-src/wiring/templates');
  const body = table(readFileSync(REAL, 'utf8')).slice(2);
  for (const [step, word] of MUST) assert.ok(body[step]?.[2]?.includes(word), `step ${step} does not name ${word}`);
  for (const r of body) assert.ok(r[2].length > 0 && r[2].length <= 160 && !r[2].includes('\n'), `the Action of step ${r[0]} is not one short line`);
  assert.deepEqual([body[0][3], body.at(-1)[3]], ['pending', 'pending'], 'a border row does not start pending');
  assert.deepEqual([body[1][3], body[2][3], body[3][3]], ['open', 'open', 'open'], 'a Worker or Reviewer row does not start open');
}
