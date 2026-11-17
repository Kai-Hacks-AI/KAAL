// Case release/T804 tests: release/C61
import assert from 'node:assert/strict';
import { load, readerPath } from './fixtures.mjs';
export const id = 'release/T804';
export const tests = ['release/C61'];
export const title = 'the branch reader passes ahead and promoted through as the host answered, and leaves them absent when the host did not answer, never as zero or false';
export async function run() {
  const { readBranches } = await load(readerPath);
  const page = async () => ({ nodes: [{ name: 'a', ahead: 0, promoted: false }, { name: 'b', ahead: 4, promoted: true }, { name: 'c' }], next: null });
  const { branches } = await readBranches('o/r', page);
  assert.deepEqual(branches[0], { name: 'a', ahead: 0, promoted: false });
  assert.deepEqual(branches[1], { name: 'b', ahead: 4, promoted: true });
  assert.deepEqual(branches[2], { name: 'c' }, 'a missing answer was filled in');
}
