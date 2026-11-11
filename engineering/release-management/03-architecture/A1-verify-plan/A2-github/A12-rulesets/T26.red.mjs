// Case release/T26 tests: release/A12
import assert from 'node:assert/strict';
export const id = 'release/T26';
export const tests = ['release/A12'];
export const title = 'rulesets require the check before a PLAN pull request merges';
export function run() { assert.fail('red: intended behaviour absent'); }
