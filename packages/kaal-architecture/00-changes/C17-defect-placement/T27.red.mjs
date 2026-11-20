// Case architecture/T27 tests: architecture/F17
import assert from 'node:assert/strict';
import { readPlacement, findPlacement } from '../../lib/placement.mjs';
export const id = 'architecture/T27';
export const tests = ['architecture/F17'];
export const title = 'a placement is found from the Defect by a derived lookup, an unplaced Defect is held where it was found, and the Defect is not needed to read it';
export function run() {
  const text = '---\nid: controls/A9\ntitle: x\naddresses: [controls/F10]\nplaces: hosting/D14\norigin: dependency\ntracesTo: [hard:foundation]\nfixOwner: foundation\n---\n';
  const p = readPlacement('packages/kaal-controls/03-architecture/A9-x/A9.md', text);
  assert.equal(p.places, 'hosting/D14');
  assert.equal(p.origin, 'dependency');
  assert.deepEqual(p.tracesTo, ['hard:foundation']);
  assert.deepEqual(findPlacement('hosting/D14', [p]), { state: 'placed', fixOwner: 'foundation', placement: 'controls/A9' });
  assert.deepEqual(findPlacement('hosting/D15', [p]), { state: 'unplaced', fixOwner: 'hosting', placement: null });
}
