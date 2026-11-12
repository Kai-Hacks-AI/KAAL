// Case coordination/T1 tests: F5, F6
import assert from 'node:assert/strict';
import { byTarget, collector, analyzeFlow, declaration, facts, promotionOf } from './fixtures.mjs';
export const id = 'coordination/T1';
export const tests = ['coordination/F5', 'coordination/F6'];
export const title = 'a pair member that has no pull request yet is OPEN PR: the promotion when the collector is fresh, the sync first and the promotion waiting on it when behind';
export async function run() {
  // both members missing, collector fresh: only the promotion is needed
  const fresh = await analyzeFlow(facts(), declaration());
  const open = fresh.actions.filter((a) => a.action === 'OPEN PR');
  assert.equal(open.length, 1, 'a fresh declared pair without a request does not yield exactly one OPEN PR');
  assert.equal(open[0].target, 'col-a');
  assert.equal(open[0].kind, 'promotion', 'the missing request is not a promotion');
  assert.equal(open[0].pair, 'col-a', 'the entry does not name its pair');
  assert.equal(open[0].layer, 'promotion');
  assert.equal(open[0].status, 'ready', 'the OPEN PR is not ready');
  assert.equal(open[0].authority, 'author', 'the OPEN PR does not name the author');

  // both members missing, collector behind: the sync, then the promotion waiting on it
  const behind = await analyzeFlow(facts({ collectors: [collector('col-a', 2)] }), declaration());
  const sync = behind.actions.find((a) => a.action === 'OPEN PR' && a.kind === 'sync');
  const promotion = behind.actions.find((a) => a.action === 'OPEN PR' && a.kind === 'promotion');
  assert.ok(sync, 'a collector behind the target does not yield an OPEN PR for its sync');
  assert.equal(sync.purpose, 'promotion', 'the sync of a declared pair is not a promotion sync');
  assert.equal(sync.change, 'c/C1', 'the sync does not name the Change of its pair');
  assert.equal(sync.status, 'ready');
  assert.ok(promotion, 'the promotion that follows the sync is not shown');
  assert.equal(promotion.status, 'waiting', 'the promotion is not waiting on the sync');
  assert.match(String(promotion.dependency), /sync/i, 'the promotion does not name the sync');
  assert.ok(sync.rank < promotion.rank, 'the sync is not listed before the promotion');

  // the promotion is open, its sync is missing: the missing partner is found
  const half = await analyzeFlow(facts({ collectors: [collector('col-a', 2)], requests: [promotionOf(5, 'col-a')] }), declaration());
  const missing = half.actions.find((a) => a.action === 'OPEN PR' && a.kind === 'sync');
  assert.ok(missing, 'an open promotion whose sync is missing does not yield an OPEN PR for the sync');
  assert.equal(missing.purpose, 'promotion');
  const waiting = byTarget(half, '#5');
  assert.equal(waiting.action, 'WAIT', 'the open promotion does not wait for its sync');
  assert.match(String(waiting.dependency), /sync/i);
  assert.ok(missing.rank < waiting.rank, 'the sync is not listed before the promotion that waits for it');
}
