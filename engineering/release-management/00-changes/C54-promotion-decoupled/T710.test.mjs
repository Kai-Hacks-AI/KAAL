// Case release/T710 tests: release/C54
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { rows } from './fixtures.mjs';
export const id = 'release/T710';
export const tests = ['release/C54'];
export const title = 'the PROMOTION table names a neutral source branch with branch quality as its entry criterion, checks freshness without naming a SYNC, and its last row drops WIRE';
export async function run() {
  const body = rows();
  assert.equal(body.length, 5, 'the PROMOTION table is not five rows');
  for (const w of ['Main requires', 'source branch', 'branch quality', 'single-promotion seat']) assert.ok(body[0][2].includes(w), `step 0 does not name ${w}`);
  for (const w of ['kaal/', 'hotfix/', 'wire/']) assert.ok(!body[0][2].includes(w), `step 0 names the branch kind ${w}`);
  for (const w of ["main's tip", 'omit']) assert.ok(body[1][2].includes(w), `step 1 does not name ${w}`);
  assert.ok(!/sync|c45/i.test(body[1][2]), 'step 1 names the SYNC');
  const last = body.at(-1)[2];
  for (const w of ['into main, which requires', 'releases the seat', 'nothing starts automatically']) assert.ok(last.includes(w), `the last row does not name ${w}`);
  assert.ok(!/wire/i.test(last), 'the last row names WIRE');
  for (const r of body) assert.ok(r[2].length <= 160 && !r[2].includes('\n'), `the Action of step ${r[0]} is not one short line`);
}
