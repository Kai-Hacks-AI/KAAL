// Case F1/T3 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T3';
export const tests = ['F1'];
export const title = 'an Architecture node that traces to no Requirement or no Defect is rejected';
export function run() { assert.fail('red: intended behaviour absent'); }
