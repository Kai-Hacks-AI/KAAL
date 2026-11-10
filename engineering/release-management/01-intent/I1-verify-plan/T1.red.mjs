// Case I1/T1 tests: I1
import assert from 'node:assert/strict';
export const id = 'I1/T1';
export const tests = ['I1'];
export const title = 'a PLAN without a traced red plan is not accepted';
export function run() { assert.fail('red: intended behaviour absent'); }
