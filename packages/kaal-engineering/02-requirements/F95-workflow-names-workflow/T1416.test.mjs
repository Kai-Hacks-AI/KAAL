// Case engineering/T1416 tests: engineering/F95
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src, runs } from './fixture.mjs';
export const id = 'engineering/T1416';
export const tests = ['engineering/F95'];
export const title = 'the head fetched as a ref and laid out as a worktree, and nothing executed from the head folder';
export async function run() {
  const text = readFileSync(src, 'utf8');
  const all = runs(text).join('\n');
  assert.match(all, /git fetch .*refs\/pull\/\$\{PR_NUMBER\}\/head/, 'a pull request head is not fetched as a ref');
  assert.match(all, /git fetch .*\$\{?MERGE_GROUP_HEAD_REF/, 'a merge queue head is not fetched as a ref');
  assert.match(all, /git worktree add\b/, 'the head is not laid out with git worktree add');
  assert.ok(!/^\s*(node|npm|npx|sh|bash)\s+"?[^\s"]*(\$HEAD_DIR|RUNNER_TEMP\/head)/m.test(all), 'a command runs a script from the head folder');
}
