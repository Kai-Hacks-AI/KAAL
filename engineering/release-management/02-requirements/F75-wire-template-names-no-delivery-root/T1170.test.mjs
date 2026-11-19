// Case release/T1170 tests: release/F75
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1170';
export const tests = ['release/F75'];
export const title = 'the WIRE template source names no delivery root and points to the declaration, and keeps its three chapters';
export async function run() {
  const src = join(RM, '05-src/wiring/templates/wire.md');
  assert.ok(existsSync(src), 'the WIRE template source is absent');
  const text = readFileSync(src, 'utf8');
  assert.doesNotMatch(text, /\.github|\.githooks|\.kaal|\.agents|\.claude/, 'the template spells a delivery root');
  const decl = '03-architecture/A67-delivery-locations/delivery-locations.json';
  assert.ok(existsSync(join(RM, decl)), 'the declaration is absent');
  assert.ok(text.includes('engineering/release-management/' + decl), 'the template does not point to the declaration');
  assert.deepEqual([...text.matchAll(/^## (.*)$/gm)].map((m) => m[1]), ['Source', 'Target', 'Verification'], 'the chapters changed');
}
