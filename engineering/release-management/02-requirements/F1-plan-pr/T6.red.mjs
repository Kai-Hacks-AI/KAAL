// Case F1/T6 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T6';
export const tests = ['F1'];
export const title = 'a Case that is green or wired into a lane is rejected';
export function run() { assert.fail('red: intended behaviour absent'); }
