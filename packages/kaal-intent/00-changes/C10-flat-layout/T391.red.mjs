// Case intent/T391 tests: intent/G2
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkgDir = join(repo, 'packages/kaal-intent');
export const id = 'intent/T391';
export const tests = ['intent/G2'];
export const title = 'gap intent/G2 is closed: kaal-intent names @kaihacksai/kaal-hosting and claims its flat path, and no file names the old ones';
function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === '00-changes' || name === 'plan') return [];
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}
export function run() {
  assert.ok(existsSync(join(pkgDir, 'package.json')), 'packages/kaal-intent/package.json is absent');
  const claim = JSON.parse(readFileSync(join(pkgDir, 'ownership.kaal.json'), 'utf8'));
  assert.deepEqual(claim.paths, ['packages/kaal-intent/']);
  const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  assert.ok('@kaihacksai/kaal-hosting' in { ...pkg.dependencies, ...pkg.devDependencies }, 'the package does not name @kaihacksai/kaal-hosting');
  const stale = files(pkgDir).filter((f) => /packages\/skills\/kaal-intent|["'\s]kaal-hosting["'\s]/.test(readFileSync(f, 'utf8')));
  assert.deepEqual(stale, [], 'files still name the old paths or package');
}
