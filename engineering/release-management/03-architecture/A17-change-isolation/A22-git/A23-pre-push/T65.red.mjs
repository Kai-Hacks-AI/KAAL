// Case release/T65 tests: release/A23
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const judgeFile = join(repo, 'engineering/change-isolation/check.mjs');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const frontmatter = (path, what) => read(path, what).split('---')[1] ?? '';
const judge = async () => { const m = await import(pathToFileURL(judgeFile).href); assert.equal(typeof m.judge, 'function', 'the judge is not exported'); return m.judge; };
export const id = 'release/T65';
export const tests = ['release/A23'];
export const title = 'the pre-push hook runs the declared check Change-Isolation by its own declaration';
export async function run() {
  assert.match(read(join(cap, '03-architecture/A17-change-isolation/A22-git/A23-pre-push/A23.md'), 'A23'), /parent: release\/A22/);
  assert.match(readFileSync(join(repo, '.githooks/pre-push'), 'utf8'), /kaal-guard run --hook/);
  assert.match(frontmatter(join(repo, '.kaal/config/guard/Change-Isolation.md'), 'the Change-Isolation declaration'), /^runs: \[.*\bhook\b.*\]$/m, 'the hook does not run Change Isolation by its own declaration');
}
