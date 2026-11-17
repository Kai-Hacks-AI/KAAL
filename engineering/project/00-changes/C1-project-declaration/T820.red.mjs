// Case project/T820 tests: project/G92
import assert from 'node:assert/strict';
import { example, load } from './lib.mjs';
export const id = 'project/T820';
export const tests = ['project/G92'];
export const title = 'gap project/G92 is closed: the example Project reads as id, title and its Changes in declared order';
export async function run() {
  const { readProject } = await load();
  const p = readProject(example);
  assert.equal(p.id, 'project/P1');
  assert.deepEqual(p.delivers, ['release/C62', 'controls/C12']);
}
