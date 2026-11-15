// Case graph/T7 tests: graph/N3, graph/F4
import assert from 'node:assert/strict';
import { exported, map, shuffled } from './lib.mjs';
export const id = 'graph/T7';
export const tests = ['graph/N3', 'graph/F4'];
export const title = "the input is unchanged, the results are frozen, and a plain object works like a Map";
export function run() {
  const [cycles, reach, reverse] = ['cycles', 'reach', 'reverse'].map(exported);
  const s = { b: ['a'], a: ['b'] };
  const before = JSON.stringify(s);
  const found = cycles(s);
  assert.deepEqual(found, cycles(map(s)));
  assert.deepEqual([...reach(s, 'a')], [...reach(map(s), 'a')]);
  reverse(s);
  assert.equal(JSON.stringify(s), before);
  assert.ok(Object.isFrozen(found) && found.every(Object.isFrozen));
}
