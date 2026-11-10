// Case C1/T2 tests: C1/G2
import assert from 'node:assert/strict';
export const id = 'C1/T2';
export const tests = ['C1/G2'];
export const title = 'gap C1/G2 is closed: I1 and its Case are present';
export function run() { assert.fail('red: intended behaviour absent'); }
