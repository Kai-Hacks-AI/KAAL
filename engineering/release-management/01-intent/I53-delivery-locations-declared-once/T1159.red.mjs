// Case release/T1159 tests: release/I53
import assert from 'node:assert/strict';
import { text, loadSrc } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1159';
export const tests = ['release/I53'];
export const title = 'the delivery locations are declared once, and KAAL declares .github, .githooks and .kaal as wirable';
export async function run() {
  assert.match(text('01-intent/I53-delivery-locations-declared-once/I53.md'), /^id: release\/I53$/m);
  const { readLocations } = await loadSrc('delivery/locations.mjs');
  const l = readLocations();
  assert.deepEqual([...l.wirable].sort(), ['.github', '.githooks', '.kaal'].sort());
  assert.deepEqual([...l.roots].sort(), ['.github', '.githooks', '.kaal'].sort());
}
