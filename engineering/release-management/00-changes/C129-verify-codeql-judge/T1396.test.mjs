// Case release/T1396 tests: release/C129
import assert from 'node:assert/strict';
import { FINDINGS, an, alert, BOTH, EXPECTED } from './fixtures.mjs';
export const id = 'release/T1396';
export const tests = ['release/C129'];
export const title = 'the two threshold dimensions count an open alert at or above either, and an unknown value is not guessed';
export async function run() {
  const { findingsOf } = await import(FINDINGS);
  const f = (alerts, thresholds) => findingsOf({ sha: 'abc', expected: EXPECTED, analyses: BOTH, alerts, thresholds });
  const T = { security: 'high_or_higher', alerts: 'errors' };
  assert.deepEqual(f([alert(1, 'warning', 'high'), alert(2, 'warning', 'critical'), alert(3, 'warning', 'medium')], T), ['alert:1', 'alert:2']);
  assert.deepEqual(f([alert(4, 'error', undefined), alert(5, 'warning', undefined)], T), ['alert:4']);
  assert.deepEqual(f([alert(6, 'error', 'low')], { security: 'off', alerts: 'errors' }), ['alert:6']);
  assert.deepEqual(f([alert(6, 'error', 'high')], { security: 'off', alerts: 'off' }), []);
  assert.deepEqual(f([alert(8, 'error', 'critical', { state: 'dismissed' }), alert(9, 'error', 'critical', { state: 'fixed' })], T), []);
  assert.throws(() => f([], { security: 'high', alerts: 'errors' }), /threshold/);
  assert.throws(() => f([], { security: 'high_or_higher' }), /threshold/);
}
