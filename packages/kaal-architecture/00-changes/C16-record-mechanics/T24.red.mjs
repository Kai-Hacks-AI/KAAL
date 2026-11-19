// Case architecture/T24 tests: architecture/F15
import assert from 'node:assert/strict';
import { checkAddresses } from '../../lib/records.mjs';
export const id = 'architecture/T24';
export const tests = ['architecture/F15'];
export const title = 'an A-record that addresses nothing, or a Requirement that does not exist, is reported by its id; a good one is not';
export function run() {
  const requirements = ['controls/F10'];
  const records = [
    { id: 'controls/A1', addresses: ['controls/F10'] },
    { id: 'controls/A2', addresses: [] },
    { id: 'controls/A3', addresses: ['controls/F99'] },
  ];
  const found = checkAddresses(records, requirements);
  assert.deepEqual(found.map((f) => f.id).sort(), ['controls/A2', 'controls/A3']);
}
