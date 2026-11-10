// Case F1/T5 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T5';
export const tests = ['F1'];
export const title = 'a Case whose tests list is missing or names anything but its own artefact is rejected';
export function run() { assert.fail('red: intended behaviour absent'); }
