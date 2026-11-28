// Case controls/T1729 tests: controls/F227
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'controls/T1729';
export const tests = ['controls/F227'];
export const title = 'the controls package is a workspace of the repository root and its lock names it, so the required Workspaces lane runs its suite on a pull request and in the merge group, and the package gains no dependency or script';
const json = (p) => JSON.parse(readFileSync(join(repo, p), 'utf8'));
export async function run() {
  const root = json('package.json');
  assert.ok(Array.isArray(root.workspaces), 'the root declares no workspaces');
  assert.ok(root.workspaces.includes('packages/kaal-controls'), 'packages/kaal-controls is not a workspace of the root, so the Workspaces lane never runs its Cases');
  assert.equal(new Set(root.workspaces).size, root.workspaces.length, 'a workspace is listed twice');
  for (const w of root.workspaces) assert.ok(existsSync(join(repo, w, 'package.json')), `the workspace ${w} has no package.json`);
  const lock = json('package-lock.json');
  assert.ok(lock.packages['packages/kaal-controls'], 'the lock has no entry packages/kaal-controls, so npm ci does not install the tree the root describes');
  assert.deepEqual(lock.packages['node_modules/@kaihacksai/kaal-controls'], { resolved: 'packages/kaal-controls', link: true }, 'the lock has no workspace link for the controls package');
  const pkg = json('packages/kaal-controls/package.json');
  assert.equal(pkg.name, '@kaihacksai/kaal-controls');
  assert.equal(typeof pkg.scripts?.test, 'string', 'the package has no test entrypoint, so the lane would not count it as verified');
  assert.equal(pkg.private, true, 'private stays as the lock against a publish');
  assert.equal(pkg.dependencies, undefined, 'joining the workspaces adds no dependency to the package');
  assert.equal(pkg.devDependencies, undefined);
  assert.deepEqual(Object.keys(pkg.scripts), ['test'], 'joining the workspaces adds no script to the package');
}
