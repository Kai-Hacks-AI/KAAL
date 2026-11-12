// Case coordination/T5 tests: F7, F8
import assert from 'node:assert/strict';
import { bad, byTarget, collector, analyzeFlow, declaration, facts, ok, piece, syncInto } from './fixtures.mjs';
export const id = 'coordination/T5';
export const tests = ['coordination/F7', 'coordination/F8'];
export const title = 'a development sync, named for the Change it unblocks, does not occupy the promotion lane';
export async function run() {
  const blocked = piece(21, { into: 'col-dev', change: 'c/C7', checks: [ok('build'), bad('fresh')] });
  const sync = syncInto(20, 'col-dev', 'c/C7');
  const state = facts({ collectors: [collector('col-a'), collector('col-dev', 3)], pieces: [blocked, sync] });
  const result = await analyzeFlow(state, declaration());
  const entry = byTarget(result, '#20');
  assert.ok(entry, 'the development sync yields no entry');
  assert.equal(entry.purpose, 'development', 'a sync that names a blocked Change is not a development sync');
  const promotion = result.actions.find((a) => a.action === 'OPEN' && a.target === 'col-a' && a.kind === 'promotion');
  assert.ok(promotion, 'the promotion of the active pair is not offered while only a development sync is open');
  assert.equal(promotion.status, 'ready', 'the development sync blocks the promotion lane');
  const wait = byTarget(result, '#21');
  assert.equal(wait.action, 'WAIT', 'the blocked piece does not wait for its sync');
  assert.match(String(wait.dependency), /#20/);
}
