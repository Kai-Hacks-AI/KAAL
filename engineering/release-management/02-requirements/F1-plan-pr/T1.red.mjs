// Case F1/T1 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T1';
export const tests = ['F1'];
export const title = 'a Change that implements no Intent is rejected';
export function run() { assert.fail('red: intended behaviour absent'); }
