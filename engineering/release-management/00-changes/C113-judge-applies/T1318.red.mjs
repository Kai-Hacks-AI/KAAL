// Case release/T1318 tests: release/F88
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const PHASE = join(RM, '05-src/phase');
const use = (name) => { const f = join(PHASE, name); assert.ok(existsSync(f), `${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'release/T1318';
export const tests = ['release/F88'];
export const title = 'demand Act says whether it had anything to judge: Given the carried Changes and the retros, When it judges, Then PASS applies only when exactly one retro reflects every carried Change, and FAIL and UNKNOWN always apply';
export async function run() {
  const { judgeDemandAct } = await use('judge-demand-act.mjs');
  const app = (id) => ({ id, applicable: [{ id: `${id}/T`, parked: false }] });
  const two = [app('x/C1'), app('x/C2')];
  const green = { 'x/C1/T': 'GREEN', 'x/C2/T': 'GREEN' };
  const verdictOf = (r) => [r.verdict, r.applies];
  // Given work not finished and no retro, Then nothing is due: PASS with nothing to judge.
  assert.deepEqual(verdictOf(judgeDemandAct({ changes: two, retros: [], observed: { ...green, 'x/C2/T': 'RED' } })), ['PASS', false]);
  // Given exactly one retro that reflects every carried Change, Then PASS and it applies.
  const one = judgeDemandAct({ changes: two, retros: [{ reflects: ['x/C1', 'x/C2'] }], observed: green });
  assert.deepEqual(verdictOf(one), ['PASS', true]);
  assert.equal(one.acts, 1);
  // Given a retro for one of two Changes while the other is open, Then nothing is due and it is not final: PASS that does not apply.
  assert.deepEqual(verdictOf(judgeDemandAct({ changes: two, retros: [{ reflects: ['x/C1'] }], observed: { ...green, 'x/C2/T': 'RED' } })), ['PASS', false]);
  // Given two retros, or a closed Change with no retro, Then FAIL, which applies.
  assert.deepEqual(verdictOf(judgeDemandAct({ changes: two, retros: [{ reflects: ['x/C1'] }, { reflects: ['x/C2'] }], observed: green })), ['FAIL', true]);
  assert.deepEqual(verdictOf(judgeDemandAct({ changes: two, retros: [], observed: green })), ['FAIL', true]);
  // Given facts it cannot read or cannot tell, Then UNKNOWN, which applies.
  assert.deepEqual(verdictOf(judgeDemandAct({ changes: 'x', retros: [] })), ['UNKNOWN', true]);
  assert.deepEqual(verdictOf(judgeDemandAct({ changes: two, retros: [], observed: { 'x/C1/T': 'GREEN' } })), ['UNKNOWN', true]);
  // The fields it always gave stay.
  assert.deepEqual(one.due, []);
  assert.equal(one.message, 'nothing is due');
}
