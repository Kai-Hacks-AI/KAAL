// Case intent/T390 tests: intent/G1
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'intent/T390';
export const tests = ['intent/G1'];
export const title = 'gap intent/G1 is closed: kaal-intent is a root workspace at packages/kaal-intent';
export function run() {
  const pkg = join(repo, 'packages/kaal-intent/package.json');
  assert.ok(existsSync(pkg), 'packages/kaal-intent/package.json is absent');
  assert.equal(JSON.parse(readFileSync(pkg, 'utf8')).name, 'kaal-intent');
  const root = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'));
  assert.ok(root.workspaces.includes('packages/kaal-intent'), 'packages/kaal-intent is not a root workspace');
}
