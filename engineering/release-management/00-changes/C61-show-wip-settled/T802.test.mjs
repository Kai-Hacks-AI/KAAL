// Case release/T802 tests: release/C61
import assert from 'node:assert/strict';
import { config, facts, load, merged, closed, placeOf, scriptPath } from './fixtures.mjs';
export const id = 'release/T802';
export const tests = ['release/C61'];
export const title = 'the overview counts the delivered and the discarded branches of each place, and the overview lines show them';
export async function run() {
  const { showWip, renderInventory } = await load(scriptPath);
  const names = [
    facts('kaal/release/delivered', { head: 'a1', ahead: 2, settled: merged('a1') }),
    facts('kaal/release/discarded', { head: 'b1', ahead: 2, settled: closed('b1') }),
    facts('kaal/release/wip', { head: 'c1', ahead: 2, settled: false }),
    facts('hotfix/a', { head: 'd1', ahead: 1, settled: merged('d1') }),
  ];
  const report = showWip({ pieces: [], branches: names, gaps: [] }, config());
  const kaal = report.inventory.overview.places.find((p) => p.place === 'kaal');
  const hotfix = report.inventory.overview.places.find((p) => p.place === 'hotfix');
  assert.deepEqual([kaal.delivered, kaal.discarded], [1, 1]);
  assert.deepEqual([hotfix.delivered, hotfix.discarded], [1, 0]);
  assert.ok(placeOf(report, 'kaal'), 'the place is absent');
  assert.match(renderInventory(report), /kaal .*1 delivered, 1 discarded/, 'the overview line shows no counts');
}
