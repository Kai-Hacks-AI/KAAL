// Case architecture/T28 tests: architecture/F17
import assert from 'node:assert/strict';
import { checkPlacements } from '../../lib/placement.mjs';
export const id = 'architecture/T28';
export const tests = ['architecture/F17'];
export const title = 'a Defect has at most one placement, and a placement keeps the Defect id';
export function run() {
  const a = { id: 'controls/A9', places: ['hosting/D14'], fixOwner: 'foundation' };
  const b = { id: 'testing/A3', places: ['hosting/D14'], fixOwner: 'core' };
  const f = checkPlacements([a, b], { hosting: ['hosting/D14'] });
  assert.deepEqual(f.filter((x) => x.verdict === 'INVALID').map((x) => x.id).sort(), ['controls/A9', 'testing/A3']);
  assert.deepEqual(checkPlacements([a], { hosting: ['hosting/D14'] }), []);
}
