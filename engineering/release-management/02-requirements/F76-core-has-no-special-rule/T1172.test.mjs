// Case release/T1172 tests: release/F76
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RM } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1172';
export const tests = ['release/F76'];
export const title = '.github travels alone still holds, alone, also beside Core paths';
export async function run() {
  const { check } = await import(pathToFileURL(join(RM, '..', 'change-isolation', 'check.mjs')).href);
  assert.deepEqual(check(['.github/workflows/a.yml', '.github/dependabot.yml']), [], '.github alone is refused');
  const v = check(['.github/workflows/a.yml', 'engineering/x.md']);
  assert.equal(v.length, 1);
  assert.match(v[0], /^\.github travels alone: engineering\/x\.md/);
  const c = check(['.github/workflows/a.yml', 'packages/kaal-core/src/cli.ts']);
  assert.equal(c.length, 1, 'Core beside .github is reported once, by the .github rule');
  assert.match(c[0], /^\.github travels alone: packages\/kaal-core\/src\/cli\.ts/);
}
