// Case architecture/T27 tests: architecture/F17
import assert from 'node:assert/strict';
import { readPlacement, fixOwner } from '../../lib/placement.mjs';
export const id = 'architecture/T27';
export const tests = ['architecture/F17'];
export const title = 'a Defect is fixed by the capability that found it unless a placement names another';
export function run() {
  const text = '---\nid: controls/A9\ntitle: x\naddresses: [controls/F10]\nplaces: [hosting/D14]\nfixOwner: foundation\n---\n';
  const p = readPlacement('packages/kaal-controls/03-architecture/A9-x/A9.md', text);
  assert.deepEqual(p.places, ['hosting/D14']);
  assert.equal(p.fixOwner, 'foundation');
  assert.equal(fixOwner('hosting/D14', [p]), 'foundation');
  assert.equal(fixOwner('hosting/D15', [p]), 'hosting');
}
