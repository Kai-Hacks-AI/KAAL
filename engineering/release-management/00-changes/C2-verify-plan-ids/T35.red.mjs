// Case release/T35 tests: release/G7
import assert from 'node:assert/strict';
export const id = 'release/T35';
export const tests = ['release/G7'];
export const title = 'gap release/G7 is closed: F1 states the id form and the placement fallback';
export function run() { assert.fail('red: intended behaviour absent'); }
