// Case engineering/T1424 tests: engineering/F96
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src, runs } from '../F95-workflow-names-workflow/fixture.mjs';
export const id = 'engineering/T1424';
export const tests = ['engineering/F96'];
export const title = 'the base commit and the head are fetched as Git data, the head is a worktree, and nothing runs from the head folder';
export async function run() {
  const all = runs(readFileSync(src, 'utf8')).join('\n');
  assert.match(all, /git fetch .*"?\$\{?BASE_SHA\b/, 'the base commit is not fetched');
  assert.match(all, /git fetch .*refs\/pull\/\$\{PR_NUMBER\}\/head/, 'a pull request head is not fetched as a ref');
  assert.match(all, /git fetch .*\$\{?MERGE_GROUP_HEAD_REF/, 'a merge queue head is not fetched as a ref');
  assert.match(all, /git worktree add\b/, 'the head is not laid out with git worktree add');
  assert.ok(!/^\s*(node|npm|npx|sh|bash)\s+"?[^\s"]*(\$HEAD_DIR|RUNNER_TEMP\/head)/m.test(all), 'a command runs a script from the head folder');
}
