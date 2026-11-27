// Case engineering/T1591 tests: engineering/F101
import assert from 'node:assert/strict';
import { srcPath, read, concurrencyBlock } from './fixture.mjs';
export const id = 'engineering/T1591';
export const tests = ['engineering/F101'];
export const title = 'the concurrency group is keyed by the pull request number or the sha and cancels only on pull_request';
export async function run() {
  const block = concurrencyBlock(read(srcPath));
  assert.ok(block, 'the workflow has no concurrency block');
  assert.match(block, /^ {2}group: ci-\$\{\{ github\.event\.pull_request\.number \|\| github\.sha \}\}\s*$/m, 'the group is not ci-<pull request number or sha>');
  assert.match(block, /^ {2}cancel-in-progress: \$\{\{ github\.event_name == 'pull_request' \}\}\s*$/m, 'cancel-in-progress is not limited to pull_request');
  assert.ok(!/github\.workflow/.test(block), 'the group uses github.workflow, which several files share');
}
