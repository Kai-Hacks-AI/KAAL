// Case release/T33 tests: release/G5
import assert from 'node:assert/strict';
export const id = 'release/T33';
export const tests = ['release/G5'];
export const title = 'gap release/G5 is closed: D1 and its Case are present';
export function run() { assert.fail('red: intended behaviour absent'); }
