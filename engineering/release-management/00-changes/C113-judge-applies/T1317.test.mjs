// Case release/T1317 tests: release/F88
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const PHASE = join(RM, '05-src/phase');
const use = (name) => { const f = join(PHASE, name); assert.ok(existsSync(f), `${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'release/T1317';
export const tests = ['release/F88'];
export const title = 'hold Act says whether it had anything to judge: Given the carried Changes, the retros and the observations, When it judges, Then PASS applies only when a retro reflects a carried Change and its Cases are green, and FAIL and UNKNOWN always apply';
export async function run() {
  const { judgeHold } = await use('judge-act.mjs');
  const changes = [{ id: 'x/C1', applicable: [{ id: 'x/T1', parked: false }, { id: 'x/T2', parked: false }] }];
  const green = { 'x/T1': 'GREEN', 'x/T2': 'GREEN' };
  const verdictOf = (r) => [r.verdict, r.applies];
  // Given no retro that reflects a carried Change, Then there is no ACT to hold: PASS with nothing to judge, whatever is red.
  assert.deepEqual(verdictOf(judgeHold({ changes, retros: [], observed: { 'x/T1': 'RED' } })), ['PASS', false]);
  assert.deepEqual(verdictOf(judgeHold({ changes, retros: [{ reflects: ['x/C9'] }], observed: {} })), ['PASS', false], 'a retro of another collector is not an ACT of this one');
  // Given a retro that reflects it, Then the Cases are judged and the answer applies.
  assert.deepEqual(verdictOf(judgeHold({ changes, retros: [{ reflects: ['x/C1'] }], observed: green })), ['PASS', true]);
  assert.deepEqual(verdictOf(judgeHold({ changes, retros: [{ reflects: ['x/C1'] }], observed: { ...green, 'x/T2': 'RED' } })), ['FAIL', true]);
  assert.deepEqual(verdictOf(judgeHold({ changes, retros: [{ reflects: ['x/C1'] }], observed: { 'x/T1': 'GREEN' } })), ['UNKNOWN', true], 'an unobserved Case is not green');
  // Given facts it cannot read, Then UNKNOWN, which applies.
  assert.deepEqual(verdictOf(judgeHold({ changes: 'x', retros: [], observed: green })), ['UNKNOWN', true]);
  assert.deepEqual(verdictOf(judgeHold({ changes, retros: [{ reflects: ['C1'] }], observed: green })), ['UNKNOWN', true], 'an unqualified id cannot be judged');
  // The message and the counts are what they were.
  assert.match(judgeHold({ changes, retros: [{ reflects: ['x/C1'] }], observed: { ...green, 'x/T2': 'RED' } }).message, /finish your work first: x\/T2 of 2 applicable Cases/);
}
