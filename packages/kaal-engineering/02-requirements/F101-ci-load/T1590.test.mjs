// Case engineering/T1590 tests: engineering/F101
import assert from 'node:assert/strict';
import { srcPath, read, onBlock } from './fixture.mjs';
export const id = 'engineering/T1590';
export const tests = ['engineering/F101'];
export const title = 'the ci workflow source runs on pull_request and merge_group only, with no push trigger';
export async function run() {
  const triggers = [...onBlock(read(srcPath)).matchAll(/^ {2}([a-z_]+):/gm)].map((m) => m[1]).sort();
  assert.deepEqual(triggers, ['merge_group', 'pull_request'], `the triggers are ${triggers.join(', ')}`);
}
