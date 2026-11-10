// Case A13/T1 tests: A13
import assert from 'node:assert/strict';
export const id = 'A13/T1';
export const tests = ['A13'];
export const title = 'the integration ruleset requires the status verify Plan';
export function run() { assert.fail('red: intended behaviour absent'); }
