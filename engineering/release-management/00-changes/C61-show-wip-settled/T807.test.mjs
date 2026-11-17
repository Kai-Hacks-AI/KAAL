// Case release/T807 tests: release/C61
import assert from 'node:assert/strict';
import { config, entryOf, facts, load, closed, discarded, merged, scriptPath, readerPath } from './fixtures.mjs';
export const id = 'release/T807';
export const tests = ['release/C61'];
export const title = 'a piece closed unmerged is a transport outcome, never a decision to discard: the branch stays UNKNOWN, is not counted, marked or listed as settled, while an explicit discard decision still settles it';
export async function run() {
  const { showWip, render, renderInventory } = await load(scriptPath);
  const { settledOf } = await load(readerPath);
  // the reader reports a closed unmerged piece as closed, never as discarded
  const read = settledOf([{ state: 'closed', closed_at: '2026-11-03', merged_at: null, head: { sha: 'x1' } }]);
  assert.deepEqual(read, { outcome: 'closed', head: 'x1' }, 'the reader promoted a closed transport to a discard');
  const branches = [
    facts('kaal/release/superseded', { head: 'x1', ahead: 5, settled: closed('x1') }),
    facts('kaal/release/moved', { head: 'y2', ahead: 0, settled: closed('y1') }),
    facts('kaal/release/decided', { head: 'z1', ahead: 2, settled: discarded('z1') }),
    facts('kaal/release/delivered', { head: 'd1', ahead: 1, settled: merged('d1') }),
  ];
  const report = showWip({ pieces: [], branches, gaps: [] }, config());
  for (const b of ['superseded', 'moved']) {
    const e = entryOf(report, `kaal/release/${b}`);
    assert.deepEqual([e.state, e.settled], ['UNKNOWN', false], `${b}: a closed transport settled the branch`);
  }
  assert.deepEqual(['decided', 'delivered'].map((b) => entryOf(report, `kaal/release/${b}`).state), ['discarded', 'delivered']);
  const kaal = report.inventory.overview.places.find((p) => p.place === 'kaal');
  assert.deepEqual([kaal.delivered, kaal.discarded], [1, 1], 'a closed transport was counted as settled');
  const view = renderInventory(report, { place: 'settled' });
  assert.ok(!/superseded|moved/.test(view), 'a closed transport is listed as settled');
}
