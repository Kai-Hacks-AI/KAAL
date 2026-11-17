// Case release/T555 tests: C39 (the PR observations are retained, the inventory only adds)
import assert from 'node:assert/strict';
import { branches, config, load, piece, scriptPath } from './fixtures.mjs';
export const id = 'release/T555';
export const tests = ['release/C39'];
export const title = 'with the inventory the existing station report, review sequence and render are unchanged, and a report from facts without branches has no inventory';
export async function run() {
  const { showWip, render } = await load(scriptPath);
  const pieces = [piece(1, { from: 'kaal/release/a', into: 'main', review: 'none', head: 'abc1234def' }), piece(2, { title: 'SYNC: x', from: 'main', into: 'kaal/release/a', head: 'fed4321' })];
  const without = showWip({ pieces, gaps: ['one gap'] }, config({ review: { stations: ['Promotion', 'Integration'], types: ['SYNC', 'PROMOTION'], sync: 'SYNC' } }));
  assert.ok(!('inventory' in without), 'facts without branches produce an inventory');
  const withBranches = showWip({ pieces, branches: branches('kaal/release/a'), gaps: ['one gap'] }, config({ review: { stations: ['Promotion', 'Integration'], types: ['SYNC', 'PROMOTION'], sync: 'SYNC' } }));
  assert.ok(withBranches.inventory, 'facts with branches produce no inventory');
  const { inventory, ...rest } = withBranches;
  assert.deepEqual(rest, without, 'the inventory changed the station report, not-observed list or review sequence');
  assert.equal(render(withBranches), render(without), 'render changed with the inventory');
}
