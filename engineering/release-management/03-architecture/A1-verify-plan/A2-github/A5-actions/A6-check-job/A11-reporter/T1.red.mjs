// Case A11/T1 tests: A11
import assert from 'node:assert/strict';
export const id = 'A11/T1';
export const tests = ['A11'];
export const title = 'the reporter emits a verdict and a Recovery line for every failure';
export function run() { assert.fail('red: intended behaviour absent'); }
