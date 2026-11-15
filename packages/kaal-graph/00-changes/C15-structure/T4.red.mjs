// Case graph/T4 tests: graph/F3, graph/F4
import assert from 'node:assert/strict';
import { exported, map, shuffled } from './lib.mjs';
export const id = 'graph/T4';
export const tests = ['graph/F3', 'graph/F4'];
export const title = "reverse derives sorted predecessors, including for a successor that is not a key";
export function run() {
  const reverse = exported('reverse');
  const r = reverse(map({ c: ['z'], a: ['z', 'b'], b: [] }));
  assert.deepEqual(Object.fromEntries(r), { a: [], b: ['a'], c: [], z: ['a', 'c'] });
}
