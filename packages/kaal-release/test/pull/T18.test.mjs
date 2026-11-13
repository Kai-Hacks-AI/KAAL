// Case pull/T18 tests: pull/F20
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
export const id = 'pull/T18';
export const tests = ['pull/F20'];
export const title = 'the command exists, imports nothing of Show WIP, and nothing in the repository triggers it: no hook, workflow or scheduled job names it';
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
  assert.ok(existsSync(join(dir, 'run.mjs')), 'the command does not exist');
  const sources = readdirSync(dir).filter((f) => /\.mjs$/.test(f)).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
  assert.ok(!/analyze-flow|show-wip/i.test(sources), 'the command imports or names Show WIP: the two capabilities must not depend on each other');
  const triggers = [join(repoRoot, '.github'), join(repoRoot, '.githooks'), join(repoRoot, '.husky')].filter(existsSync).flatMap((d) => walk(d));
  const naming = triggers.filter((file) => /\.(ya?ml|sh|mjs|js|json)$|(^|[\\/])(pre-commit|pre-push|commit-msg|post-merge)$/.test(file) && /pull-promotion/.test(readFileSync(file, 'utf8')));
  assert.deepEqual(naming, [], `a trigger names the command: ${naming.join(', ')}`);
}
