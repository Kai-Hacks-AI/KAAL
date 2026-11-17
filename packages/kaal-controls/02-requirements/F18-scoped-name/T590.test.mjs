// Case controls/T590 tests: controls/F18
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(fileURLToPath(import.meta.url).split('/packages/')[0], 'packages/kaal-controls');
const pkg = () => JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
export const id = 'controls/T590';
export const tests = ['controls/F18'];
export const title = 'the package name is @kaihacksai/kaal-controls';
export async function run() {
  assert.equal(pkg().name, '@kaihacksai/kaal-controls');
}
