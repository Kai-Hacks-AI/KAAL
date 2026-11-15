// Case graph/T6 tests: graph/N2, graph/A2
import assert from 'node:assert/strict';
import { exported, map, shuffled } from './lib.mjs';
export const id = 'graph/T355';
export const tests = ['graph/N2', 'graph/A2'];
export const title = "a 100 000-member chain and ring finish without exhausting the stack, and the ring is one cycle";
export function run() {
  const [cycles, reach] = ['cycles', 'reach'].map(exported);
  const n = 100_000;
  const key = (i) => `n${String(i).padStart(6, '0')}`;
  const chain = new Map(Array.from({ length: n }, (_, i) => [key(i), i + 1 < n ? [key(i + 1)] : []]));
  assert.deepEqual(cycles(chain), []);
  assert.equal([...reach(chain, key(0))].length, n);
  const ring = new Map(Array.from({ length: n }, (_, i) => [key(i), [key((i + 1) % n)]]));
  const found = cycles(ring);
  assert.equal(found.length, 1);
  assert.equal(found[0].length, n);
}
