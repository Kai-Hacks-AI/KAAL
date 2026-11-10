// Case F1/T2 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T2';
export const tests = ['F1'];
export const title = 'a Requirement that serves no Intent is rejected';
export function run() { assert.fail('red: intended behaviour absent'); }
