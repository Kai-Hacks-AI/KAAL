// Case release/T68 tests: release/G17
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
export const id = 'release/T68';
export const tests = ['release/G17'];
export const title = 'gap release/G17 is closed: Change Isolation declares a hook placement of its own';
export async function run() {
  const decl = frontmatter(join(repo, '.kaal/config/guard/Change-Isolation.md'), 'the Change-Isolation declaration');
  assert.match(decl, /^runs: \[.*\bhook\b.*\]$/m, 'Change Isolation declares no hook placement of its own');
}
