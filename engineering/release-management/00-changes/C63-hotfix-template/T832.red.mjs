// Case release/T832 tests: release/C63
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { REAL, table } from './fixtures.mjs';
export const id = 'release/T832';
export const tests = ['release/C63'];
export const title = 'the rows of the HOTFIX template say what a correction from a hotfix branch needs and name no other process: each named word is in the Action of its row, every Action is one short line, and none names a PLAN, DO, ACT, SYNC, PROMOTION or WIRE';
const MUST = [
  [0, 'hotfix branch'],
  [0, "main's tip"],
  [0, 'RED Case'],
  [1, 'draft HOTFIX PR'],
  [2, 'smallest change'],
  [2, 'GREEN'],
  [2, 'exact head'],
  [3, 'RED to GREEN'],
  [3, 'Urgency'],
  [3, 'approve the exact head'],
  [4, 'Merge the approved HOTFIX'],
  [4, 'approval alone does not merge'],
];
export async function run() {
  assert.ok(existsSync(REAL), 'hotfix.md is absent from 05-src/wiring/templates');
  const body = table(readFileSync(REAL, 'utf8')).slice(2);
  for (const [step, word] of MUST) assert.ok(body[step]?.[2]?.includes(word), `step ${step} does not name ${word}`);
  for (const r of body) {
    assert.ok(r[2].length > 0 && r[2].length <= 200 && !r[2].includes('\n'), `the Action of step ${r[0]} is not one short line`);
    assert.ok(!/\b(PLAN|DO|ACT|SYNC|PROMOTION|WIRE)\b/.test(r[2]), `the Action of step ${r[0]} names another process`);
  }
  assert.deepEqual([body[0][3], body.at(-1)[3]], ['pending', 'pending'], 'a border row does not start pending');
  assert.deepEqual([body[1][3], body[2][3], body[3][3]], ['open', 'open', 'open'], 'a Worker or Reviewer row does not start open');
}
