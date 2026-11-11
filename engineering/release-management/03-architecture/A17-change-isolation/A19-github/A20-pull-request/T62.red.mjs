// Case release/T62 tests: release/A20
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
export const id = 'release/T62';
export const tests = ['release/A20'];
export const title = 'the pull request check runs the declared Guard check Change-Isolation';
export async function run() {
  assert.match(read(join(cap, '03-architecture/A17-change-isolation/A19-github/A20-pull-request/A20.md'), 'A20'), /parent: release\/A19/);
  assert.match(readFileSync(join(repo, '.github/workflows/change-isolation.yml'), 'utf8'), /--check Change-Isolation/);
}
