// Case F1/T7 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T7';
export const tests = ['F1'];
export const title = 'an id that does not resolve, or a template heading that cannot be parsed, is rejected';
export function run() { assert.fail('red: intended behaviour absent'); }
