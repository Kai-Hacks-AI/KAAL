// Case release/T1407 tests: release/C130
import assert from 'node:assert/strict';
import { findingsOf, uses } from '../../05-src/triggers/verify-triggers.mjs';
export const id = 'release/T1407';
export const tests = ['release/C130'];
export const title = 'the report of verify Triggers is the sorted list of the workflows that use pull_request_target: a comment, a branch name and a string are no finding, and the four forms of on are found';
export async function run() {
  const w = (p) => `.github/workflows/${p}.yml`;
  const tree = {
    [w('z')]: 'on: pull_request_target\n',
    [w('y')]: 'on: [push, pull_request_target]\n',
    [w('x')]: 'on:\n  pull_request_target:\n    types: [opened]\n',
    [w('v')]: 'on:\n  - push\n  - pull_request_target\n',
    [w('comment')]: '# pull_request_target is replaced\non:\n  pull_request:\n',
    [w('branch')]: 'on:\n  pull_request:\n    branches: [pull_request_target]\n',
    [w('string')]: 'on: push\njobs:\n  a:\n    steps:\n      - run: echo "pull_request_target"\n',
  };
  assert.deepEqual(findingsOf(tree), [w('v'), w('x'), w('y'), w('z')]);
  assert.equal(uses(tree[w('string')]), false);
  assert.deepEqual(findingsOf({}), []);
}
