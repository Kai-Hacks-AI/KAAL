// Case F1/T8 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T8';
export const tests = ['F1'];
export const title = 'unreadable input is a failure, not a pass, and every failure carries a Recovery line';
export function run() { assert.fail('red: intended behaviour absent'); }
