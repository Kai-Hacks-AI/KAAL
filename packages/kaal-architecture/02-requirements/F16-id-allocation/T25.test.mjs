// Case architecture/T25 tests: architecture/F16
import assert from 'node:assert/strict';
import { nextId } from '../../lib/records.mjs';
export const id = 'architecture/T25';
export const tests = ['architecture/F16'];
export const title = 'the next A-number is one more than the highest observed in the namespace, ignoring gaps and other namespaces, 1 when none; it is derived from what is observed and promises no permanence';
export function run() {
  assert.equal(nextId('controls', ['controls/A5', 'controls/A8', 'controls/A14']), 'controls/A15');
  assert.equal(nextId('controls', ['foundation/A7']), 'controls/A1');
  // observed only: with the highest record gone from the observation, the suggestion follows what is observed
  assert.equal(nextId('controls', ['controls/A5', 'controls/A8']), 'controls/A9');
}
