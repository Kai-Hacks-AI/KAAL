// Case F1/T4 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T4';
export const tests = ['F1'];
export const title = 'an Intent, Requirement, Architecture node or Defect with no Case beside it is rejected';
export function run() { assert.fail('red: intended behaviour absent'); }
