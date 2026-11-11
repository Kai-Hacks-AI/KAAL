// Case release/T27 tests: release/A13
import assert from 'node:assert/strict';
export const id = 'release/T27';
export const tests = ['release/A13'];
export const title = 'the integration ruleset requires the status verify Plan';
export function run() { assert.fail('red: intended behaviour absent'); }
