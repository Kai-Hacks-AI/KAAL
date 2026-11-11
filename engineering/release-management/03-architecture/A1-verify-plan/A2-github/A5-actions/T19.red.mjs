// Case release/T19 tests: release/A5
import assert from 'node:assert/strict';
export const id = 'release/T19';
export const tests = ['release/A5'];
export const title = 'a workflow runs the check on every PLAN pull request';
export function run() { assert.fail('red: intended behaviour absent'); }
