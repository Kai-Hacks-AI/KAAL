// Case coordination/T44 tests: F14 (the reader maps the head)
import assert from 'node:assert/strict';
import { node, page, readOpenPulls } from './review-fixtures.mjs';
export const id = 'coordination/T44';
export const tests = ['coordination/F14'];
export const title = 'the reader maps the host\'s head into the facts of every piece';
export async function run() {
  const read = await readOpenPulls('o/r', async () => page([node(1), node(2)]));
  assert.deepEqual(read.pieces.map((p) => p.head), ['h1', 'h2'], 'the head is not in the facts');
}
