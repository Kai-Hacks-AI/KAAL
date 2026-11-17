// Case release/T804 tests: release/C61
import assert from 'node:assert/strict';
import { load, readerPath } from './fixtures.mjs';
export const id = 'release/T804';
export const tests = ['release/C61'];
export const title = 'the branch reader passes head, ahead and settled through as the host answered, and leaves them absent when the host did not answer, never as zero, false or none';
export async function run() {
  const { readBranches } = await load(readerPath);
  const page = async () => ({ nodes: [{ name: 'a', head: 'a1', ahead: 0, settled: false }, { name: 'b', head: 'b1', ahead: 4, settled: { outcome: 'merged', head: 'b1' } }, { name: 'c' }], next: null });
  const { branches } = await readBranches('o/r', page);
  assert.deepEqual(branches[0], { name: 'a', head: 'a1', ahead: 0, settled: false });
  assert.deepEqual(branches[1], { name: 'b', head: 'b1', ahead: 4, settled: { outcome: 'merged', head: 'b1' } });
  assert.deepEqual(branches[2], { name: 'c' }, 'a missing answer was filled in');
}
