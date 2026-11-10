// Case A8/T1 tests: A8
import assert from 'node:assert/strict';
export const id = 'A8/T1';
export const tests = ['A8'];
export const title = 'the resolver resolves every id and link, reports each one that does not resolve, rejects a parent of another kind, and never derives fulfillment from parent';
export function run() { assert.fail('red: intended behaviour absent'); }
