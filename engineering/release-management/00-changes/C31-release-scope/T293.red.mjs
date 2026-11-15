// Case release/T293 tests: F53
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T293';
export const tests = ['release/F53'];
export const title = 'readiness: kaal-release 0.0.1 has a declared scope and every required Change in it is delivered on main';

// A readiness Case: it stays RED until the scope is delivered and is never a prerequisite of a collector's ACT.
const changeIds = () => {
  const found = new Set();
  const roots = ['engineering', ...readdirSync(join(repo, 'packages')).map((p) => `packages/${p}`)];
  for (const root of roots) {
    const dirs = [join(repo, root, '00-changes'), ...(existsSync(join(repo, root)) ? readdirSync(join(repo, root), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => join(repo, root, d.name, '00-changes')) : [])];
    for (const dir of dirs) {
      if (!existsSync(dir)) continue;
      const cap = dir.split('/').slice(-2)[0].replace(/^kaal-/, '');
      for (const name of readdirSync(dir)) found.add(`${cap === 'engineering' ? 'release' : cap}/${name.split('-')[0]}`);
    }
  }
  return found;
};
export function run() {
  const file = join(repo, 'engineering/release-management/05-src/scope/kaal-release-0.0.1.json');
  assert.ok(existsSync(file), 'kaal-release 0.0.1 has no declared scope');
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  const have = changeIds();
  const missing = manifest.changes.filter((c) => c.role === 'required' && !have.has(c.id)).map((c) => c.id);
  assert.deepEqual(missing, [], `required Changes not on main: ${missing.join(', ')}`);
}
