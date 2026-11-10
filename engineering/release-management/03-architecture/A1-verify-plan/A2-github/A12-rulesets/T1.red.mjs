// Case A12/T1 tests: A12
import assert from 'node:assert/strict';
export const id = 'A12/T1';
export const tests = ['A12'];
export const title = 'rulesets require the check before a PLAN pull request merges';
export function run() { assert.fail('red: intended behaviour absent'); }
