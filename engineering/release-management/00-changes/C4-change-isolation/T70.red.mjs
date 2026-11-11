// Case release/T70 tests: release/G19
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
export const id = 'release/T70';
export const tests = ['release/G19'];
export const title = 'gap release/G19 is closed: A17 and its deployment targets are present';
export async function run() {
  read(join(cap, '03-architecture/A17-change-isolation/A17.md'), 'A17');
  read(join(cap, '03-architecture/A17-change-isolation/A19-github/A19.md'), 'A19');
  read(join(cap, '03-architecture/A17-change-isolation/A22-git/A22.md'), 'A22');
}
