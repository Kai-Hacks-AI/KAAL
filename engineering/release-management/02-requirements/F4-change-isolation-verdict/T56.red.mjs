// Case release/T56 tests: release/F4
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
export const id = 'release/T56';
export const tests = ['release/F4'];
export const title = 'the judge returns PASS, FAIL or UNKNOWN and UNKNOWN never passes';
export async function run() {
  const verdict = async (paths, opts) => (await judge())(paths, opts).verdict;
  assert.equal(await verdict(['packages/kaal-core/x.mjs', 'package.json']), 'PASS');
  assert.equal(await verdict(['packages/kaal-core/x.mjs', 'README.md']), 'FAIL');
  assert.equal(await verdict(['.github/workflows/x.yml', 'README.md']), 'FAIL');
  const entry = { id: 'case', paths: ['README.md', 'packages/kaal-core/x.mjs'], pre: { 'README.md': null, 'packages/kaal-core/x.mjs': null }, post: { 'README.md': null, 'packages/kaal-core/x.mjs': null } };
  assert.equal(await verdict(['README.md', 'packages/kaal-core/x.mjs'], { ledger: [entry] }), 'UNKNOWN', 'a change that cannot be judged must not pass');
}
