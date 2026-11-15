// Case release/T441 tests: F23
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T441';
export const tests = ['release/F23'];
export const title = 'HOW TO WORK references: engineering paths that exist, never packages';

// A reference is a repository path under engineering/ in backticks-free prose; packages/ is never allowed.
export function paths(text) {
  return [...text.matchAll(/(?<![\w/.-])((?:engineering|packages|\.kaal)\/[\w./#-]*[\w/])/g)].map((m) => m[1]);
}
export function run() {
  const files = [join(repo, 'engineering/HOW-TO-WORK.md')];
  const dir = join(repo, 'engineering/release-management/03-architecture/A49-how-to-work');
  assert.ok(existsSync(files[0]), 'the HOW TO WORK definition is absent');
  assert.ok(existsSync(dir), 'the guidance folder is absent');
  for (const f of readdirSync(dir)) files.push(join(dir, f));
  for (const f of files) {
    for (const p of paths(readFileSync(f, 'utf8'))) {
      assert.ok(!p.startsWith('packages/'), `${f} points into packages/: ${p}`);
      assert.ok(existsSync(join(repo, p.split('#')[0])), `${f} points at a path that does not exist: ${p}`);
    }
  }
  assert.equal(
    (readFileSync(files[0], 'utf8').match(/^## Resolution$/gm) ?? []).length, 1,
    'the resolution rule must be stated once, in HOW-TO-WORK.md');
}
