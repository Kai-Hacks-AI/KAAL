// Case F1/T3 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T3';
export const tests = ['F1'];
export const title = 'an Architecture node with no fulfills of its own, a child whose fulfills is not within its parent, a node fulfilled only through parent, or a root node with no addressed Defect is rejected';
export function run() { assert.fail('red: intended behaviour absent'); }
