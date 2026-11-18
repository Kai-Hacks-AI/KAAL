// Case release/T800 tests: release/C61
import assert from 'node:assert/strict';
import { config, entryOf, facts, load, merged, closed, discarded, scriptPath } from './fixtures.mjs';
export const id = 'release/T800';
export const tests = ['release/C61'];
export const title = 'a branch whose newest piece merged and whose tip is that piece\'s head is delivered, one with an explicit decision to discard is discarded, one whose piece only closed unmerged is UNKNOWN, one with commits no piece covers is wip, and one with no evidence is UNKNOWN';
export async function run() {
  const { showWip } = await load(scriptPath);
  const names = [
    facts('kaal/release/delivered', { head: 'a1', ahead: 3, settled: merged('a1') }),
    facts('kaal/release/discarded', { head: 'b1', ahead: 2, settled: discarded('b1') }),
    facts('kaal/release/closedonly', { head: 'e1', ahead: 4, settled: closed('e1') }),
    facts('kaal/release/wip', { head: 'c1', ahead: 3, settled: false }),
    facts('kaal/release/unknown'),
  ];
  const report = showWip({ pieces: [], branches: names, gaps: [] }, config());
  const state = (b) => entryOf(report, b)?.state;
  assert.equal(state('kaal/release/delivered'), 'delivered', 'squash promotion: the proof is the piece head, not ancestry');
  assert.equal(state('kaal/release/discarded'), 'discarded');
  assert.equal(state('kaal/release/closedonly'), 'UNKNOWN', 'a closed transport was read as a decision about the work');
  assert.equal(state('kaal/release/wip'), 'wip');
  assert.equal(state('kaal/release/unknown'), 'UNKNOWN');
  assert.equal(entryOf(report, 'kaal/release/unknown').settled, false, 'a branch with no facts is settled');
}
