// Case project/T823 tests: project/G92
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PKG } from './lib.mjs';
export const id = 'project/T823';
export const tests = ['project/G92'];
export const title = 'kaal-project works outside KAAL: only Foundation and Hosting as dependencies, no import outside the package';
export function run() {
  const pj = join(PKG, 'package.json');
  assert.ok(existsSync(pj), 'packages/kaal-project/package.json is absent');
  const pkg = JSON.parse(readFileSync(pj, 'utf8'));
  assert.equal(pkg.name, '@kaihacksai/kaal-project');
  const allowed = new Set(['@kaihacksai/kaal-foundation', '@kaihacksai/kaal-hosting']);
  for (const dep of Object.keys(pkg.dependencies ?? {})) assert.ok(allowed.has(dep), `${dep} is not allowed`);
  const lib = readFileSync(join(PKG, 'lib/project.mjs'), 'utf8');
  assert.doesNotMatch(lib, /from\s+['"]\.\.\/\.\./, 'lib imports outside the package');
}
