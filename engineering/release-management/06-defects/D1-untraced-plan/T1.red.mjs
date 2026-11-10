// Case D1/T1 tests: D1
import assert from 'node:assert/strict';
export const id = 'D1/T1';
export const tests = ['D1'];
export const title = 'an untraced PLAN is caught';
export function run() { assert.fail('red: intended behaviour absent'); }
