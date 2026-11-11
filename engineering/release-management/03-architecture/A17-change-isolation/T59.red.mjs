// Case release/T59 tests: release/A17
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
export const id = 'release/T59';
export const tests = ['release/A17'];
export const title = 'the control addresses F4, F5 and F6 and is applied through the judge and two deployment targets';
export async function run() {
  const a = read(join(cap, '03-architecture/A17-change-isolation/A17.md'), 'A17');
  assert.match(a, /addresses: \[release\/F4, release\/F5, release\/F6\]/);
  for (const [p, w] of [['03-architecture/A17-change-isolation/A18-judge/A18.md', 'A18'], ['03-architecture/A17-change-isolation/A19-github/A19.md', 'A19'], ['03-architecture/A17-change-isolation/A22-git/A22.md', 'A22']]) assert.match(read(join(cap, p), w), /parent: release\/A17/);
}
