// Case coordination/T8 tests: F4
import assert from 'node:assert/strict';
import { bad, analyzeFlow, declaration, facts, ok, piece } from './fixtures.mjs';
export const id = 'coordination/T8';
export const tests = ['coordination/F4'];
export const title = 'the same inputs give byte-identical output, whatever the order of the pieces';
export async function run() {
  const pieces = [piece(3, { review: null, landsOnApproval: false }), piece(1, { checks: [bad('build'), ok('fresh')] }), piece(2, { openComments: 1 })];
  const state = (list) => facts({ pieces: list });
  const first = JSON.stringify(await analyzeFlow(state(pieces), declaration()));
  const second = JSON.stringify(await analyzeFlow(state(pieces), declaration()));
  const shuffled = JSON.stringify(await analyzeFlow(state([...pieces].reverse()), declaration()));
  assert.equal(second, first, 'two runs on the same inputs differ');
  assert.equal(shuffled, first, 'the order of the pieces changes the output');
}
