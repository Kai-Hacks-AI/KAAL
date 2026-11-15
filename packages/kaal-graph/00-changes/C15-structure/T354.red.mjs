// Case graph/T5 tests: graph/N1
import assert from 'node:assert/strict';
import { exported, map, shuffled } from './lib.mjs';
export const id = 'graph/T354';
export const tests = ['graph/N1'];
export const title = "the same structure in any key and successor order gives the same cycles, reach and reverse";
export function run() {
  const [cycles, reach, reverse] = ['cycles', 'reach', 'reverse'].map(exported);
  const s = { a: ['b', 'd'], b: ['c'], c: ['a', 'e'], d: ['d'], e: ['f'], f: ['e'] };
  assert.deepEqual(cycles(shuffled(s)), cycles(map(s)));
  assert.deepEqual([...reach(shuffled(s), 'a')], [...reach(map(s), 'a')]);
  assert.deepEqual(Object.fromEntries(reverse(shuffled(s))), Object.fromEntries(reverse(map(s))));
}
