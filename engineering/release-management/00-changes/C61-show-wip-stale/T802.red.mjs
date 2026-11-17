// Case release/T802 tests: release/C61
import assert from 'node:assert/strict';
import { config, facts, load, placeOf, scriptPath } from './fixtures.mjs';
export const id = 'release/T802';
export const tests = ['release/C61'];
export const title = 'the overview counts the empty and the done branches of each place, and the overview lines show them';
export async function run() {
  const { showWip, renderInventory } = await load(scriptPath);
  const names = [
    facts('kaal/release/empty', { ahead: 0, promoted: false }),
    facts('kaal/release/done', { ahead: 2, promoted: true }),
    facts('kaal/release/open', { ahead: 2, promoted: false }),
    facts('hotfix/a', { ahead: 0, promoted: false }),
  ];
  const report = showWip({ pieces: [], branches: names, gaps: [] }, config());
  const kaal = report.inventory.overview.places.find((p) => p.place === 'kaal');
  const hotfix = report.inventory.overview.places.find((p) => p.place === 'hotfix');
  assert.deepEqual([kaal.empty, kaal.done], [1, 1]);
  assert.deepEqual([hotfix.empty, hotfix.done], [1, 0]);
  assert.ok(placeOf(report, 'kaal'), 'the place is absent');
  const text = renderInventory(report);
  assert.match(text, /kaal .*1 empty, 1 done/, 'the overview line shows no counts');
}
