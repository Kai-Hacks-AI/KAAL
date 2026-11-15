// Case graph/T3 tests: graph/F2, graph/F4
import assert from 'node:assert/strict';
import { exported, map, shuffled } from './lib.mjs';
export const id = 'graph/T3';
export const tests = ['graph/F2', 'graph/F4'];
export const title = "reach yields each identity once, includes start, terminates on a cycle and reaches a successor that is not a key";
export function run() {
  const reach = exported('reach');
  assert.deepEqual([...reach(map({ a: ['c', 'b'], b: ['a'], c: ['z'] }), 'a')], ['a', 'b', 'c', 'z']);
  assert.deepEqual([...reach(map({ a: ['a'] }), 'a')], ['a']);
  assert.deepEqual([...reach(map({}), 'lonely')], ['lonely']);
}
