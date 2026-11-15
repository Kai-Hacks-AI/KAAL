// Case graph/T1 tests: graph/F1, graph/F4
import assert from 'node:assert/strict';
import { exported, map, shuffled } from './lib.mjs';
export const id = 'graph/T1';
export const tests = ['graph/F1', 'graph/F4'];
export const title = "an acyclic structure has no cycles, and a self-edge is a cycle of one";
export function run() {
  const cycles = exported('cycles');
  assert.deepEqual(cycles(map({ a: ['b', 'c'], b: ['c'], c: [] })), []);
  assert.deepEqual(cycles(map({ a: ['b'], b: [] })), []);
  assert.deepEqual(cycles(map({ x: ['x'], y: ['x'] })), [['x']]);
}
