// Case release/T803 tests: release/C61
import assert from 'node:assert/strict';
import { config, facts, load, merged, discarded, piece, scriptPath } from './fixtures.mjs';
export const id = 'release/T803';
export const tests = ['release/C61'];
export const title = 'a place view marks a delivered branch DELIVERED and a discarded one DISCARDED, the settled view lists only those in the order of the places or says there are none, and no view acts on a branch';
export async function run() {
  const { showWip, renderInventory } = await load(scriptPath);
  const names = [
    facts('kaal/release/delivered', { head: 'a1', ahead: 2, settled: merged('a1') }),
    facts('kaal/release/discarded', { head: 'b1', ahead: 2, settled: discarded('b1') }),
    facts('kaal/release/busy', { head: 'c1', ahead: 2, settled: merged('c1') }),
    facts('hotfix/a', { head: 'd1', ahead: 1, settled: merged('d1') }),
  ];
  const report = showWip({ pieces: [piece(1, { from: 'kaal/release/busy' })], branches: names, gaps: [] }, config());
  const place = renderInventory(report, { place: 'kaal' });
  assert.match(place, /^kaal\/release\/delivered DELIVERED$/m);
  assert.match(place, /^kaal\/release\/discarded DISCARDED$/m);
  const view = renderInventory(report, { place: 'settled' });
  assert.deepEqual(view.trimEnd().split('\n'), ['hotfix/a DELIVERED', 'kaal/release/delivered DELIVERED', 'kaal/release/discarded DISCARDED'], 'the settled view is not the settled branches in order');
  assert.doesNotMatch(view, /delete|remove|prune|git push/i, 'the view proposes an action');
  const none = showWip({ pieces: [], branches: [facts('kaal/release/x', { head: 'x1', ahead: 1, settled: false })], gaps: [] }, config());
  assert.equal(renderInventory(none, { place: 'settled' }).trim(), 'no settled branches');
  assert.throws(() => renderInventory(report, { place: 'nowhere' }), /unknown place/);
}
