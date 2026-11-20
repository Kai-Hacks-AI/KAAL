// Case architecture/T27 tests: architecture/F17
import assert from 'node:assert/strict';
import { checkAddresses } from '../../lib/records.mjs';
export const id = 'architecture/T27';
export const tests = ['architecture/F17'];
export const title = 'an A-record addresses an accepted Defect like a Requirement: resolved gives nothing, absent in an observed namespace is INVALID, an unobserved namespace is UNKNOWN, a finding is INVALID';
export function run() {
  const observed = { hosting: ['hosting/D14', 'hosting/F29'] };
  const v = (ref) => checkAddresses([{ id: 'a/A1', addresses: [ref] }], observed).map((x) => x.verdict);
  assert.deepEqual(v('hosting/D14'), []);
  assert.deepEqual(v('hosting/F29'), []);
  assert.deepEqual(v('hosting/D99'), ['INVALID']);
  assert.deepEqual(v('review/D1'), ['UNKNOWN']);
  assert.deepEqual(v('review/finding-3'), ['INVALID']);
}
