// Case pull/T18 tests: pull/F20
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
export const id = 'pull/T18';
export const tests = ['pull/F20'];
export const title = 'the integrated command exists and takes its observations from the shared observer, imports nothing of analyze Flow, and nothing in the repository triggers it: no hook, workflow or scheduled job names it';
const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out); else out.push(path);
  }
  return out;
};
export async function run() {
  const dir = join(repoRoot, 'engineering/release-management/05-src/pull-promotion');
  const command = join(dir, 'run.mjs');
  assert.ok(existsSync(command), 'the integrated command does not exist');
  const source = readFileSync(command, 'utf8');
  assert.match(source, /host-observation\//, 'the command does not import the shared observer');
  assert.ok(existsSync(join(repoRoot, 'engineering/release-management/05-src/host-observation')), 'the shared observer it uses is not in the repository');
  assert.ok(!/analyze-flow/.test(source), 'the command imports or names analyze Flow: the two capabilities must not depend on each other');
  // nothing triggers it: workflows, git hooks, husky-style hook folders and scheduled-job definitions
  const triggers = [join(repoRoot, '.github'), join(repoRoot, '.githooks'), join(repoRoot, '.husky')].filter(existsSync).flatMap((d) => walk(d));
  const naming = triggers.filter((file) => /\.(ya?ml|sh|mjs|js|json)$|(^|[\\/])(pre-commit|pre-push|commit-msg|post-merge)$/.test(file) && /pull-promotion/.test(readFileSync(file, 'utf8')));
  assert.deepEqual(naming, [], `a trigger names the command: ${naming.join(', ')}`);
}
