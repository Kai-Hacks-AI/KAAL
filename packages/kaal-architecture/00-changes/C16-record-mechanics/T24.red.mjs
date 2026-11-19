// Case architecture/T24 tests: architecture/F15
import assert from 'node:assert/strict';
import { checkAddresses } from '../../lib/records.mjs';
export const id = 'architecture/T24';
export const tests = ['architecture/F15'];
export const title = 'a reference is resolved, INVALID (empty, malformed, or absent in an observed namespace) or UNKNOWN (namespace not observed), and UNKNOWN is never reported as invalid';
export function run() {
  const observed = { controls: ['controls/F10'] };
  const records = [
    { id: 'controls/A1', addresses: ['controls/F10'] },
    { id: 'controls/A2', addresses: [] },
    { id: 'controls/A3', addresses: ['controls/F99'] },
    { id: 'controls/A4', addresses: ['foundation/F1'] },
    { id: 'controls/A5', addresses: ['nonsense'] },
  ];
  const f = checkAddresses(records, observed);
  const verdict = (rid) => f.filter((x) => x.id === rid).map((x) => x.verdict);
  assert.deepEqual(verdict('controls/A1'), []);
  assert.deepEqual(verdict('controls/A2'), ['INVALID']);
  assert.deepEqual(verdict('controls/A3'), ['INVALID']);
  assert.deepEqual(verdict('controls/A4'), ['UNKNOWN']);
  assert.deepEqual(verdict('controls/A5'), ['INVALID']);
}
