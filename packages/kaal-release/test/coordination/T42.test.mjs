// Case coordination/T42 tests: F13 (a pending sync ahead)
import assert from 'node:assert/strict';
import { config, showWip, typed } from './review-fixtures.mjs';
export const id = 'coordination/T42';
export const tests = ['coordination/F13'];
export const title = 'an open sync into a REVIEW piece\'s from or into makes it not clean and is named; a sync is not behind itself; an unrelated or undeclared sync changes nothing';
const find = (report, ref) => report.review?.find((r) => r.ref === ref);
export async function run() {
  const promotion = typed(9, 'PROMOTION', { from: 'col/a', into: 'target' });
  const sync = typed(4, 'SYNC', { from: 'target', into: 'col/a' });
  const report = await showWip({ pieces: [promotion, sync] }, config());
  const behind = find(report, '#9');
  assert.ok(behind, 'the promotion has no entry');
  assert.equal(behind.clean, false, 'a promotion with a sync into its collector is clean');
  assert.match(behind.reasons.join(' '), /sync.*#4/i, 'the sync is not named');
  assert.match(behind.reasons.join(' '), /col\/a/, 'the place the sync goes into is not named');
  assert.equal(find(report, '#4')?.clean, true, 'the sync is behind itself');

  const toTarget = await showWip({ pieces: [promotion, typed(6, 'SYNC', { from: 'x', into: 'target' })] }, config());
  assert.equal(find(toTarget, '#9').clean, false, 'a sync into the same target does not count');

  const unrelated = await showWip({ pieces: [promotion, typed(5, 'SYNC', { from: 'target', into: 'col/z' })] }, config());
  assert.equal(find(unrelated, '#9').clean, true, 'an unrelated sync counts');

  const undeclared = await showWip({ pieces: [promotion, typed(8, 'DO', { from: 'target', into: 'col/a' })] }, config());
  assert.equal(find(undeclared, '#9').clean, true, 'a piece that is not a sync counts as one');
}
