// Case architecture/T25 tests: architecture/F16
import assert from 'node:assert/strict';
import { nextId } from '../../lib/records.mjs';
export const id = 'architecture/T25';
export const tests = ['architecture/F16'];
export const title = 'the next A-number of a capability is one more than the highest used, ignoring gaps, and starts at 1 when there is none';
export function run() {
  assert.equal(nextId('controls', ['controls/A5', 'controls/A8', 'controls/A14']), 'controls/A15');
  assert.equal(nextId('controls', ['foundation/A7']), 'controls/A1');
}
