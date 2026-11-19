// Case release/T1171 tests: release/F76
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RM } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1171';
export const tests = ['release/F76'];
export const title = 'a change that holds Core and other paths is not refused for being Core, by check and by the CLI';
export async function run() {
  const file = join(RM, '..', 'change-isolation', 'check.mjs');
  const { check } = await import(pathToFileURL(file).href);
  for (const paths of [
    ['packages/kaal-core/src/cli.ts', 'engineering/y.md'],
    ['.kaal/core/Node.md', 'packages/kaal-sealing/payload/Sealing.md'],
    ['packages/kaal-core/src/cli.ts', 'README.md', 'packages/kaal-core-extra/index.ts'],
  ]) assert.deepEqual(check(paths), [], 'Core is refused: ' + paths.join(' '));
  const r = spawnSync('node', [file], { input: 'packages/kaal-core/src/cli.ts\nengineering/y.md\n', encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^ok:/);
}
