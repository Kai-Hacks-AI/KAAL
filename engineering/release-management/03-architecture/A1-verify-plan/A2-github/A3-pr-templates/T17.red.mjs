// Case release/T17 tests: release/A3
import assert from 'node:assert/strict';
export const id = 'release/T17';
export const tests = ['release/A3'];
export const title = 'a pull request template exists for the PLAN type';
export function run() { assert.fail('red: intended behaviour absent'); }
