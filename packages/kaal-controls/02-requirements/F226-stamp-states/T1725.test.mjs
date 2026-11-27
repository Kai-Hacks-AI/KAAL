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
export const title = 'flagState reads what the flag chooses and never reads an unknown value as stopped or advisory, and judgeStamp finds Torn and Mute, blocks under Preventing, and asks for the proof of an earlier Advisory run';
export async function run() {
  const { flagState, judgeStamp } = await load('stamp.mjs');
  for (const [v, s] of [['preventing', 'PREVENTING'], ['on', 'PREVENTING'], ['advisory', 'ADVISORY'], ['off', 'ADVISORY'], ['stopped', 'STOPPED'],
    [null, 'UNKNOWN'], ['', 'UNKNOWN'], ['ON', 'UNKNOWN'], ['maybe', 'UNKNOWN'], [undefined, 'UNKNOWN'], [1, 'UNKNOWN']]) assert.equal(flagState(v), s, String(v));
  const r = (verdict, applied, run = 'r') => ({ run, verdict, mode: applied ? 'preventive' : 'off', applied });
  const j = (declared, runs) => { const x = judgeStamp({ declared, runs }); return [x.stamp, x.blocking, x.reasons]; };
  assert.deepEqual(j('STOPPED', []), ['STOPPED', false, []]);
  assert.deepEqual(j('STOPPED', [r('PASS', false)]), ['STOPPED', false, ['ran-while-stopped']]);
  assert.deepEqual(j('STOPPED', [r('PASS', true)]), ['STOPPED', true, ['blocks-while-stopped', 'ran-while-stopped']], 'a declaration never conceals what ran');
  assert.deepEqual(j('UNKNOWN', []), ['MUTE', null, ['no-flag']]);
  assert.deepEqual(j('UNKNOWN', [r('PASS', false)]), ['MUTE', false, ['no-flag']], 'the adapter ran it switched off: it did not block');
  assert.deepEqual(j('UNKNOWN', [{ run: 'r', verdict: 'FAIL', mode: 'preventive', applied: null }]), ['MUTE', true, ['blocks-without-flag', 'no-flag']], 'a legacy caller blocks without a flag and the stamp says so');
  assert.deepEqual(j('UNKNOWN', [{ run: 'r', verdict: 'FAIL', mode: 'ratchet', applied: null }]), ['MUTE', true, ['blocks-without-flag', 'no-flag']]);
  assert.deepEqual(j('ADVISORY', [{ run: 'r', verdict: 'FAIL', mode: 'preventive', applied: null }]), ['ADVISORY', true, ['blocks-without-flag']], 'the file says advisory and the run blocked');
  assert.deepEqual(j('STOPPED', [{ run: 'r', verdict: 'FAIL', mode: 'preventive', applied: null }]), ['STOPPED', true, ['blocks-while-stopped', 'blocks-without-flag', 'ran-while-stopped']]);
  assert.deepEqual(j('ADVISORY', [r('FAIL', true)]), ['ADVISORY', true, ['blocks-while-advisory']], 'an applied run under an advisory file blocked');
  assert.deepEqual(j('ADVISORY', []), ['MUTE', null, ['no-trace']]);
  assert.deepEqual(j('PREVENTING', []), ['MUTE', null, ['no-trace']]);
  assert.deepEqual(j('ADVISORY', [r('PASS', false)]), ['ADVISORY', false, []]);
  assert.deepEqual(j('ADVISORY', [r('UNKNOWN', false)]), ['TORN', false, ['no-verdict']]);
  assert.deepEqual(j('ADVISORY', [r('PASS', false), r(null, false)]), ['TORN', false, ['no-verdict']]);
  assert.deepEqual(j('PREVENTING', [r('PASS', false), r('UNKNOWN', true)]), ['TORN', true, ['no-verdict']]);
  assert.deepEqual(j('PREVENTING', [r('PASS', false), r('PASS', true)]), ['PREVENTING', true, []]);
  assert.deepEqual(j('PREVENTING', [r('FAIL', true), r('PASS', true)]), ['PREVENTING', true, ['unproven-preventing']], 'no Preventing without an earlier Advisory run');
  assert.deepEqual(j('PREVENTING', [r('UNKNOWN', false), r('PASS', true)]), ['PREVENTING', true, ['unproven-preventing']], 'an Advisory run that gave no verdict is no proof');
  assert.deepEqual(j('PREVENTING', [r('PASS', false), r('PASS', false)]), ['ADVISORY', null, ['flag-not-applied']]);
  assert.deepEqual(j('PREVENTING', [r('PASS', false), r('PASS', null)]), ['ADVISORY', null, ['flag-not-applied']]);
  assert.throws(() => judgeStamp({ declared: 'ON', runs: [] }));
  assert.throws(() => judgeStamp({ declared: 'ADVISORY', runs: 'x' }));
  assert.throws(() => judgeStamp({ declared: 'ADVISORY', runs: [{ run: 'r' }] }));
  assert.throws(() => judgeStamp());
}
