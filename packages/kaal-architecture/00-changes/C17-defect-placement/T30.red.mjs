// Case architecture/T30 tests: architecture/N3
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as placement from '../../lib/placement.mjs';
export const id = 'architecture/T30';
export const tests = ['architecture/N3'];
export const title = 'placement only reads placements, names the fix owner and checks; it registers, closes and changes nothing, and depends on nothing but the record mechanics';
export function run() {
  assert.deepEqual(Object.keys(placement).sort(), ['checkPlacements', 'fixOwner', 'readPlacement']);
  const src = readFileSync(new URL('../../lib/placement.mjs', import.meta.url), 'utf8');
  const imports = [...src.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(imports.filter((i) => i !== './records.mjs'), []);
  assert.ok(!/writeFile|appendFile|status/.test(src), 'placement writes nothing and sets no status');
}
