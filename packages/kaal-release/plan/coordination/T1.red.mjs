// Case coordination/T1 tests: F5, F6
import assert from 'node:assert/strict';
import { coordinate, declaration, facts } from './fixtures.mjs';
export const id = 'coordination/T1';
export const tests = ['coordination/F5', 'coordination/F6'];
export const title = 'a declared candidate with no request yields OPEN PR: its promotion when fresh, its sync first and the promotion waiting on it when behind';
export async function run() {
  const fresh = await coordinate(facts(), declaration());
  const open = fresh.actions.filter((a) => a.action === 'OPEN PR' && a.target === 'col-a');
  assert.equal(open.length, 1, 'a fresh candidate without a promotion request does not yield exactly one OPEN PR');
  assert.equal(open[0].kind, 'promotion', 'the missing request is not a promotion');
  assert.equal(open[0].status, 'ready', 'the OPEN PR is not ready');
  assert.equal(open[0].authority, 'author', 'the OPEN PR does not name the author as its authority');

  const behind = await coordinate(facts({ collectors: [{ name: 'col-a', head: 'a1', behindTarget: 2 }] }), declaration());
  const opens = behind.actions.filter((a) => a.action === 'OPEN PR' && a.target === 'col-a');
  const sync = opens.find((a) => a.kind === 'sync');
  const promotion = opens.find((a) => a.kind === 'promotion');
  assert.ok(sync, 'a candidate behind the target does not yield an OPEN PR for its sync');
  assert.equal(sync.purpose, 'promotion', 'the sync of the declared candidate is not a promotion sync');
  assert.equal(sync.status, 'ready', 'the sync is not ready');
  assert.ok(promotion, 'the promotion that follows the sync is not shown');
  assert.equal(promotion.status, 'waiting', 'the promotion is not waiting on the sync');
  assert.ok(promotion.dependency, 'the promotion names no dependency');
  assert.ok(sync.rank < promotion.rank, 'the sync is not listed before the promotion');
}
