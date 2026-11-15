// Case graph/T2 tests: graph/F1, graph/I1
import assert from 'node:assert/strict';
import { exported, map, shuffled } from './lib.mjs';
export const id = 'graph/T2';
export const tests = ['graph/F1', 'graph/I1'];
export const title = "a cycle is reported with its members sorted, disjoint cycles apart and in order, cycles sharing a member as one component";
export function run() {
  const cycles = exported('cycles');
  assert.deepEqual(cycles(map({ 's/A1': ['s/D1'], 's/D1': ['s/T2'], 's/T2': ['s/A1', 's/F1'], 's/F1': ['s/I1'], 's/I1': ['s/C1'], 's/C1': [] })), [['s/A1', 's/D1', 's/T2']]);
  assert.deepEqual(cycles(map({ q: ['p'], p: ['q'], b: ['a'], a: ['b'] })), [['a', 'b'], ['p', 'q']]);
  assert.deepEqual(cycles(map({ a: ['b'], b: ['a', 'c'], c: ['b'] })), [['a', 'b', 'c']]);
}
