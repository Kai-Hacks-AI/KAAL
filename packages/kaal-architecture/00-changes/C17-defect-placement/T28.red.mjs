// Case architecture/T28 tests: architecture/F19
import assert from 'node:assert/strict';
import { findPlacement, checkPlacements } from '../../lib/placement.mjs';
export const id = 'architecture/T28';
export const tests = ['architecture/F19'];
export const title = 'an origin that is not established names no destination and reports UNKNOWN; one that names a fixOwner anyway is INVALID, a guess';
export function run() {
  const open = { id: 'a/A1', places: 'hosting/D14', origin: 'unknown', tracesTo: [], fixOwner: null };
  assert.deepEqual(findPlacement('hosting/D14', [open]), { state: 'UNKNOWN', fixOwner: null, placement: 'a/A1' });
  assert.deepEqual(checkPlacements([open], {}), []);
  const guess = { id: 'a/A2', places: 'hosting/D14', origin: 'unknown', tracesTo: [], fixOwner: 'foundation' };
  assert.deepEqual(checkPlacements([guess], {}).map((x) => x.verdict), ['INVALID']);
}
