// Case release/T1395 tests: release/C129
import assert from 'node:assert/strict';
import { FINDINGS, an, alert, EXPECTED, BOTH, T } from './fixtures.mjs';
export const id = 'release/T1395';
export const tests = ['release/C129'];
export const title = 'findingsOf names what is missing, errored or above the threshold, and a complete clean set is empty';
export async function run() {
  const { findingsOf } = await import(FINDINGS);
  const f = (analyses, alerts = []) => findingsOf({ sha: 'abc', expected: EXPECTED, analyses, alerts, thresholds: T });
  assert.deepEqual(f(BOTH), []);
  assert.deepEqual(f([BOTH[1]]), ['missing:/language:actions']);
  assert.deepEqual(f([an('/language:actions', { error: 'out of memory' }), BOTH[1]]), ['errored:/language:actions']);
  assert.deepEqual(f([an('/language:actions', { sha: 'other' }), BOTH[1]], []).sort(), ['missing:/language:actions']);
  assert.deepEqual(f([...BOTH, an('/language:python')]), []);   // an extra configuration is not a finding
  assert.deepEqual(f(BOTH, [alert(7, 'error', 'high')]), ['alert:7']);
}
