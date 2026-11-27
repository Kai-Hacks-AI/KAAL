// Case controls/T1577 tests: controls/N8
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// package-relative: the package root is the folder above this Case that holds package.json
let pkg = dirname(fileURLToPath(import.meta.url));
while (!existsSync(join(pkg, 'package.json'))) pkg = dirname(pkg);
export const id = 'controls/T1577';
export const tests = ['controls/N8'];
export const title = 'the package is ready to be published: public access, a changelog, a README that says what it is, and the licence bundled in the Skill (private is flipped only at Publishing)';
export async function run() {
  const meta = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'));
  const problems = [];
  if (meta.name !== '@kaihacksai/kaal-controls') problems.push('the package name is not @kaihacksai/kaal-controls');
  if (meta.license !== 'MIT') problems.push('the licence is not MIT');
  if (meta.publishConfig?.access !== 'public') problems.push('publishConfig.access is not public');
  if (!/^\d+\.\d+\.\d+$/.test(meta.version ?? '')) problems.push('the version is not a plain x.y.z');
  if (!existsSync(join(pkg, 'CHANGELOG.md'))) problems.push('CHANGELOG.md is absent');
  if (!existsSync(join(pkg, 'skills', 'kaal-controls', 'LICENSE'))) problems.push('the Skill does not bundle its LICENSE');
  const readme = existsSync(join(pkg, 'README.md')) ? readFileSync(join(pkg, 'README.md'), 'utf8') : '';
  if (/not published/i.test(readme)) problems.push('the README still says the package is not published');
  assert.deepEqual(problems, [], `the package is not ready to publish:\n${problems.join('\n')}`);
}
