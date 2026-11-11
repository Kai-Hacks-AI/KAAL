// Case release/T55 tests: release/I3
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
export const id = 'release/T55';
export const tests = ['release/I3'];
export const title = 'a Change Isolation Intent states what must travel independently and who owns it';
export async function run() {
  const t = read(join(cap, '01-intent/I3-change-isolation/I3.md'), 'I3');
  assert.match(t, /^id: release\/I3$/m);
  assert.match(t, /Owner:/);
}
