// Case release/T803 tests: release/C61
import assert from 'node:assert/strict';
import { config, facts, load, piece, scriptPath } from './fixtures.mjs';
export const id = 'release/T803';
export const tests = ['release/C61'];
export const title = 'a place view marks an empty branch EMPTY and a done branch DONE, and the stale view lists only the candidates in the order of the places, or says there are none';
export async function run() {
  const { showWip, renderInventory } = await load(scriptPath);
  const names = [
    facts('kaal/release/empty', { ahead: 0, promoted: false }),
    facts('kaal/release/done', { ahead: 2, promoted: true }),
    facts('kaal/release/busy', { ahead: 0, promoted: false }),
    facts('hotfix/a', { ahead: 0, promoted: false }),
  ];
  const report = showWip({ pieces: [piece(1, { from: 'kaal/release/busy' })], branches: names, gaps: [] }, config());
  const place = renderInventory(report, { place: 'kaal' });
  assert.match(place, /^kaal\/release\/empty EMPTY$/m);
  assert.match(place, /^kaal\/release\/done DONE$/m);
  const stale = renderInventory(report, { place: 'stale' }).trimEnd().split('\n');
  assert.deepEqual(stale, ['hotfix/a EMPTY', 'kaal/release/done DONE', 'kaal/release/empty EMPTY'], 'the stale view is not the candidates in order');
  const none = showWip({ pieces: [], branches: [facts('kaal/release/x', { ahead: 1, promoted: false })], gaps: [] }, config());
  assert.equal(renderInventory(none, { place: 'stale' }).trim(), 'no empty or done branches');
  assert.throws(() => renderInventory(report, { place: 'nowhere' }), /unknown place/);
}
