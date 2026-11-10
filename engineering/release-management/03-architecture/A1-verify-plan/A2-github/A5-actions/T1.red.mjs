// Case A5/T1 tests: A5
import assert from 'node:assert/strict';
export const id = 'A5/T1';
export const tests = ['A5'];
export const title = 'a workflow runs the check on every PLAN pull request';
export function run() { assert.fail('red: intended behaviour absent'); }
