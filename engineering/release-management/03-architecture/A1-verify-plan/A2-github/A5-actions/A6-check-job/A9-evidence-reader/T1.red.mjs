// Case A9/T1 tests: A9
import assert from 'node:assert/strict';
export const id = 'A9/T1';
export const tests = ['A9'];
export const title = 'the evidence reader reports a meaningful observed RED from current evidence, rejects an unconditional failure as proof, and reports missing evidence as UNKNOWN';
export function run() { assert.fail('red: intended behaviour absent'); }
