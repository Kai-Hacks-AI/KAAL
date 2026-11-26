// Case release/T1165 tests: release/F73
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RM, loadSrc } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1165';
export const tests = ['release/F73'];
export const title = 'a change that touches a delivery location contains only delivery paths, read from the declaration, and several locations may share one change';
export async function run() {
  const { deliveryMixed } = await import(pathToFileURL(join(RM, '..', 'change-isolation', 'check.mjs')).href);
  assert.equal(typeof deliveryMixed, 'function', 'the checker has no deliveryMixed');
  const { parseLocations } = await loadSrc('delivery/locations.mjs');
  const read = () => parseLocations({ locations: [{ root: '.githooks', wirable: true }, { root: '.kaal', wirable: true }], files: [{ path: 'package.json', wirable: false }] });
  const mixed = (paths) => deliveryMixed(paths, { read });
  assert.deepEqual(mixed(['.githooks/pre-push', '.kaal/config/guard/x.md', 'package.json']), [], 'several delivery locations share one change');
  assert.deepEqual(mixed(['engineering/a/x.md', 'packages/b/y.mjs']), [], 'a change that touches no delivery location is not judged');
  const m1 = mixed(['.githooks/pre-push', 'engineering/a/x.md']);
  assert.equal(m1.length, 1);
  assert.match(m1[0], /engineering\/a\/x\.md/);
  assert.equal(mixed(['package.json', 'packages/b/package.json']).length, 1, 'the root manifest is delivery, a package manifest is solution');
  assert.equal(mixed(['.githooks/a', '.githooksx/y']).length, 1, 'a root is a whole path segment');
  const core = mixed(['packages/kaal-core/src/cli.ts', 'packages/kaal-foundation/src/x.ts', '.kaal/core/x']);
  assert.equal(core.length, 2, 'a change that holds Core, another solution path and delivery is reported as mixed: every control reports what it sees, none is silenced by another');
  assert.ok(core.some((v) => /kaal-core\/src\/cli\.ts/.test(v)) && core.some((v) => /kaal-foundation/.test(v)));
  assert.equal(mixed(['.kaal']).length, 0, 'a bare root name is no delivery path, and nothing else is touched');
}
