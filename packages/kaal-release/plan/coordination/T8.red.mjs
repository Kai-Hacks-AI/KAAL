// Case coordination/T8 tests: F4
import assert from 'node:assert/strict';
import { bad, coordinate, declaration, facts, ok, request } from './fixtures.mjs';
export const id = 'coordination/T8';
export const tests = ['coordination/F4'];
export const title = 'the same inputs give byte-identical output, whatever the order of the requests';
export async function run() {
  const requests = [request(3, { review: null, autoMerge: false }), request(1, { checks: [bad('build'), ok('fresh')] }), request(2, { unresolvedThreads: 1 })];
  const state = (list) => facts({ requests: list });
  const first = JSON.stringify(await coordinate(state(requests), declaration()));
  const second = JSON.stringify(await coordinate(state(requests), declaration()));
  const shuffled = JSON.stringify(await coordinate(state([...requests].reverse()), declaration()));
  assert.equal(second, first, 'two runs on the same inputs differ');
  assert.equal(shuffled, first, 'the order of the requests changes the output');
}
