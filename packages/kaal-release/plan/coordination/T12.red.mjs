// Case coordination/T12 tests: F5, F7
import assert from 'node:assert/strict';
import { bad, byTarget, collector, analyzeFlow, declaration, facts, ok, piece } from './fixtures.mjs';
export const id = 'coordination/T12';
export const tests = ['coordination/F5', 'coordination/F7'];
export const title = 'a blocked change piece needs a development sync only when a freshness check fails behind a stale collector; a conflict, another failing check or a missing review is not a sync';
export async function run() {
  const state = facts({
    collectors: [collector('col-a'), collector('col-d', 2)],
    pieces: [
      piece(60, { into: 'col-d', change: 'c/C60', checks: [ok('build'), bad('fresh')] }),
      piece(61, { into: 'col-d', change: 'c/C61', fit: 'conflicts' }),
      piece(62, { into: 'col-d', change: 'c/C62', checks: [bad('build'), ok('fresh')] }),
      piece(63, { into: 'col-d', change: 'c/C63', review: null, landsOnApproval: false }),
      piece(64, { into: 'col-a', change: 'c/C64', checks: [ok('build'), bad('fresh')] }),
    ],
  });
  const result = await analyzeFlow(state, declaration({ promotions: [] }));
  const syncs = result.actions.filter((a) => a.action === 'OPEN' && a.kind === 'sync');
  assert.equal(syncs.length, 1, 'exactly one development sync is not recommended');
  assert.equal(syncs[0].target, 'col-d');
  assert.equal(syncs[0].change, 'c/C60', 'the sync does not name the Change it unblocks');
  assert.equal(syncs[0].purpose, 'development');
  assert.equal(syncs[0].layer, 'development');
  assert.equal(syncs[0].status, 'ready');
  assert.equal(syncs[0].authority, 'author');
  const blocked = byTarget(result, '#60');
  assert.equal(blocked.action, 'WAIT', 'the blocked piece does not wait for its sync');
  assert.match(String(blocked.dependency), /sync/i);
  assert.ok(syncs[0].rank < blocked.rank, 'the sync is not listed before the piece it unblocks');
  assert.equal(byTarget(result, '#61').action, 'REVISE', 'a conflict is treated as a sync need');
  assert.match(byTarget(result, '#61').reason, /conflict/i);
  assert.equal(byTarget(result, '#62').action, 'REVISE', 'a failing check that is not a freshness check is treated as a sync need');
  assert.equal(byTarget(result, '#63').action, 'REVIEW', 'a missing review is treated as a sync need');
  assert.equal(byTarget(result, '#64').action, 'REVISE', 'a failing freshness check on a fresh collector is treated as a sync need');
  assert.ok(!syncs.some((s) => ['c/C61', 'c/C62', 'c/C63', 'c/C64'].includes(s.change)), 'a sync is recommended for a piece that a sync does not unblock');
}
