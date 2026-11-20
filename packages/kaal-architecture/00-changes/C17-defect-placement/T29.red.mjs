// Case architecture/T29 tests: architecture/F18
import assert from 'node:assert/strict';
import { checkPlacements } from '../../lib/placement.mjs';
export const id = 'architecture/T29';
export const tests = ['architecture/F18'];
export const title = 'the trail is read upwards and sideways: malformed or absent ids are INVALID in an observed namespace, UNKNOWN in an unobserved one, and UNKNOWN is never reported as invalid; two placements of one Defect are INVALID';
export function run() {
  const observed = { controls: ['controls/A5', 'controls/F10', 'controls/I2'], hosting: ['hosting/D14'] };
  const spec = { id: 'a/A1', places: 'hosting/D14', origin: 'specification', tracesTo: ['controls/A5', 'controls/F10', 'controls/I2'], fixOwner: 'controls' };
  const v = (p) => checkPlacements([p], observed).map((x) => x.verdict);
  assert.deepEqual(v(spec), []);
  assert.deepEqual(v({ ...spec, tracesTo: ['controls/F99'] }), ['INVALID']);
  assert.deepEqual(v({ ...spec, tracesTo: ['review/F1'] }), ['UNKNOWN']);
  assert.deepEqual(v({ ...spec, tracesTo: ['nonsense'] }), ['INVALID']);
  const dep = { id: 'a/A2', places: 'hosting/D14', origin: 'dependency', tracesTo: ['soft:foundation'], fixOwner: 'foundation' };
  assert.deepEqual(v(dep), []);
  assert.deepEqual(v({ ...dep, tracesTo: ['medium:foundation'] }), ['INVALID']);
  assert.deepEqual(v({ ...dep, fixOwner: null }), ['INVALID']);
  assert.deepEqual(v({ ...dep, origin: 'elsewhere' }), ['INVALID']);
  const twice = checkPlacements([dep, { ...dep, id: 'b/A3' }], observed).filter((x) => x.verdict === 'INVALID').map((x) => x.id).sort();
  assert.deepEqual(twice, ['a/A2', 'b/A3']);
}
