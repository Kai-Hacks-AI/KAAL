// Case release/T1396 tests: release/C129
import assert from 'node:assert/strict';
import { ALERTS, alert } from './fixtures.mjs';
export const id = 'release/T1396';
export const tests = ['release/C129'];
export const title = 'the alert findings count an open alert at or above either threshold, never a closed one, and an unknown threshold value is not guessed';
export async function run() {
  const { alertFindings } = await import(ALERTS);
  const T = { security: 'high_or_higher', alerts: 'errors' };
  const f = (alerts, thresholds = T) => alertFindings({ alerts, thresholds });
  assert.deepEqual(f([alert(1, 'warning', 'high'), alert(2, 'warning', 'critical'), alert(3, 'warning', 'medium')]), ['alert:1', 'alert:2']);
  assert.deepEqual(f([alert(4, 'error', undefined), alert(5, 'warning', undefined)]), ['alert:4']);
  assert.deepEqual(f([alert(6, 'error', 'low')], { security: 'off', alerts: 'errors' }), ['alert:6']);
  assert.deepEqual(f([alert(6, 'error', 'high')], { security: 'off', alerts: 'off' }), []);
  assert.deepEqual(f([alert(8, 'error', 'critical', { state: 'dismissed' }), alert(9, 'error', 'critical', { state: 'fixed' })]), []);
  assert.deepEqual(f([alert(10, 'error', 'high'), alert(2, 'note', 'critical')]), ['alert:10', 'alert:2']);   // sorted by name, as the file is
  assert.throws(() => f([], { security: 'high', alerts: 'errors' }), /threshold/);
  assert.throws(() => f([], { security: 'high_or_higher' }), /threshold/);
}
