// Case architecture/T29 tests: architecture/F18
import assert from 'node:assert/strict';
import { checkPlacements } from '../../lib/placement.mjs';
export const id = 'architecture/T29';
export const tests = ['architecture/F18'];
export const title = 'a malformed or absent Defect is INVALID in an observed namespace, UNKNOWN in an unobserved one, and UNKNOWN is never reported as invalid';
export function run() {
  const observed = { hosting: ['hosting/D14'] };
  const placements = [
    { id: 'a/A1', places: ['hosting/D99'], fixOwner: 'foundation' },
    { id: 'a/A2', places: ['review/D1'], fixOwner: 'foundation' },
    { id: 'a/A3', places: ['nonsense'], fixOwner: 'foundation' },
    { id: 'a/A4', places: ['hosting/D14'], fixOwner: 'Not A Name' },
  ];
  const v = (rid) => checkPlacements(placements, observed).filter((x) => x.id === rid).map((x) => x.verdict);
  assert.deepEqual(v('a/A1'), ['INVALID']);
  assert.deepEqual(v('a/A2'), ['UNKNOWN']);
  assert.deepEqual(v('a/A3'), ['INVALID']);
  assert.deepEqual(v('a/A4'), ['INVALID']);
}
