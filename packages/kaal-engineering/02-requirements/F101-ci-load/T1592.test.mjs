// Case engineering/T1592 tests: engineering/F101
import assert from 'node:assert/strict';
import { srcPath, livePath, read, without } from './fixture.mjs';
export const id = 'engineering/T1592';
export const tests = ['engineering/F101'];
export const title = 'apart from its trigger and concurrency blocks the source is the live ci.yml, so no job, matrix or name changes';
export async function run() {
  assert.equal(without(read(srcPath)), without(read(livePath)), 'the source differs from the live workflow outside the on and concurrency blocks');
}
