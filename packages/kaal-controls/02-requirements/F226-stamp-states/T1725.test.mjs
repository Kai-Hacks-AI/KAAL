// Case controls/T1725 tests: controls/F226
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1725';
export const tests = ['controls/F226'];
export const title = 'judgeStamp keeps the declared decision, the observed signal and the blocking evidence apart: Torn and Mute block under Preventing and only report under Advisory, a Stopped control expects no run, an unknown decision is not a state and an unknown result is judged by the known decision, and every mismatch is named';
export async function run() {
  const { flagState, judgeStamp } = await load('stamp.mjs');
  for (const [v, s] of [['preventing', 'PREVENTING'], ['on', 'PREVENTING'], ['advisory', 'ADVISORY'], ['off', 'ADVISORY'], ['stopped', 'STOPPED'],
    [null, 'UNKNOWN'], ['', 'UNKNOWN'], ['ON', 'UNKNOWN'], ['maybe', 'UNKNOWN'], [undefined, 'UNKNOWN'], [1, 'UNKNOWN']]) assert.equal(flagState(v), s, String(v));
  const r = (verdict, applied, blocked, run = 'r') => ({ run, verdict, applied, blocked });
  const j = (declared, runs) => { const x = judgeStamp({ declared, runs }); return [x.stamp, x.observed, x.blocking, x.blocked, x.reasons]; };
  // Stopped: no run expected, so absence is not Mute, and what ran is never concealed
  assert.deepEqual(j('STOPPED', []), ['STOPPED', 'N/A', false, null, []]);
  assert.deepEqual(j('STOPPED', [r('PASS', false, false)]), ['STOPPED', 'N/A', false, false, ['ran-while-stopped']]);
  assert.deepEqual(j('STOPPED', [r('FAIL', true, true)]), ['STOPPED', 'N/A', false, true, ['blocked-while-stopped', 'ran-while-stopped']]);
  // an unknown flag is a configuration error, none of the states
  assert.deepEqual(j('UNKNOWN', []), [null, null, null, null, ['config-error']]);
  assert.deepEqual(j('UNKNOWN', [r('FAIL', null, true)]), [null, null, null, true, ['blocked-without-flag', 'config-error']]);
  // Advisory: Torn and Mute are reported and never block
  assert.deepEqual(j('ADVISORY', []), ['MUTE', 'MUTE', false, null, ['no-trace']]);
  assert.deepEqual(j('ADVISORY', [r('PASS', false, false)]), ['ADVISORY', 'OK', false, false, []]);
  assert.deepEqual(j('ADVISORY', [r('FAIL', false, false)]), ['ADVISORY', 'OK', false, false, []]);
  assert.deepEqual(j('ADVISORY', [r('UNKNOWN', false, false)]), ['TORN', 'TORN', false, false, ['no-verdict']]);
  assert.deepEqual(j('ADVISORY', [r('PASS', false, false), r(null, false, false)]), ['TORN', 'TORN', false, false, ['no-verdict']]);
  assert.deepEqual(j('ADVISORY', [r('FAIL', true, true)]), ['ADVISORY', 'OK', false, true, ['blocked-while-advisory']]);
  // Preventing: a pass allows, a fail blocks, and Torn and Mute block
  const proof = r('PASS', false, false, 'r0');
  assert.deepEqual(j('PREVENTING', [proof, r('PASS', true, false)]), ['PREVENTING', 'OK', false, false, []]);
  assert.deepEqual(j('PREVENTING', [proof, r('FAIL', true, true)]), ['PREVENTING', 'OK', true, true, []]);
  assert.deepEqual(j('PREVENTING', [proof, r('REPORT', true, false)]), ['PREVENTING', 'OK', false, false, []]);
  assert.deepEqual(j('PREVENTING', [proof, r('UNKNOWN', true, true)]), ['TORN', 'TORN', true, true, ['no-verdict']]);
  assert.deepEqual(j('PREVENTING', [proof, r(null, true, null)]), ['TORN', 'TORN', true, null, ['no-verdict']]);
  assert.deepEqual(j('PREVENTING', []), ['MUTE', 'MUTE', true, null, ['no-trace', 'unproven-preventing']]);
  assert.deepEqual(j('PREVENTING', [proof, r('FAIL', true, false)]), ['PREVENTING', 'OK', true, false, ['not-blocked-while-preventing']]);
  assert.deepEqual(j('PREVENTING', [proof, r('PASS', true, true)]), ['PREVENTING', 'OK', false, true, ['blocked-unexpectedly']]);
  // stepwise escalation: no Preventing without the proof of an earlier Advisory run that gave a verdict
  assert.deepEqual(j('PREVENTING', [r('FAIL', true, true)]), ['PREVENTING', 'OK', true, true, ['unproven-preventing']]);
  assert.deepEqual(j('PREVENTING', [r('UNKNOWN', false, false), r('FAIL', true, true)]), ['PREVENTING', 'OK', true, true, ['unproven-preventing']]);
  assert.throws(() => judgeStamp({ declared: 'ON', runs: [] }));
  assert.throws(() => judgeStamp({ declared: 'ADVISORY', runs: 'x' }));
  assert.throws(() => judgeStamp({ declared: 'ADVISORY', runs: [{ run: 'r' }] }));
  assert.throws(() => judgeStamp({ declared: 'ADVISORY', runs: [{ run: 'r', verdict: 'PASS', applied: false, blocked: 'yes' }] }));
  assert.throws(() => judgeStamp());
}
