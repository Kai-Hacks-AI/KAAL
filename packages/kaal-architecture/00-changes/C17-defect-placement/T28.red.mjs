// Case architecture/T28 tests: architecture/F18
import assert from 'node:assert/strict';
import { addressing } from '../../lib/records.mjs';
export const id = 'architecture/T28';
export const tests = ['architecture/F18'];
export const title = 'the records that address a Defect are found by a derived lookup, and a Defect no record addresses is unplaced: nothing is assumed from where it was found';
export function run() {
  const records = [
    { id: 'controls/A9', addresses: ['hosting/D14', 'controls/F10'] },
    { id: 'foundation/A2', addresses: ['foundation/F1'] },
  ];
  assert.deepEqual(addressing('hosting/D14', records), ['controls/A9']);
  assert.deepEqual(addressing('hosting/D15', records), []);
  assert.deepEqual(addressing('hosting/D14', []), []);
}
