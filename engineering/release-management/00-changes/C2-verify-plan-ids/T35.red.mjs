// Case release/T35 tests: release/C2/G2
import assert from 'node:assert/strict';
export const id = 'release/T35';
export const tests = ['release/C2/G2'];
export const title = 'gap C2/G2 is closed: F1 states the id form and the placement fallback';
export function run() { assert.fail('red: intended behaviour absent'); }
