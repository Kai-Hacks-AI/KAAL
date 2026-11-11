// Case release/T30 tests: release/C1/G2
import assert from 'node:assert/strict';
export const id = 'release/T30';
export const tests = ['release/C1/G2'];
export const title = 'gap C1/G2 is closed: I1 and its Case are present';
export function run() { assert.fail('red: intended behaviour absent'); }
