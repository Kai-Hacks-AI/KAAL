// Case coordination/T5 tests: F7
import assert from 'node:assert/strict';
import { coordinate, declaration, facts, request } from './fixtures.mjs';
export const id = 'coordination/T5';
export const tests = ['coordination/F7'];
export const title = 'a development sync does not occupy the promotion lane';
export async function run() {
  const development = request(20, { title: 'SYNC: Unblock development', base: 'col-dev', head: 'work-dev', review: null, autoMerge: false });
  const state = facts({
    collectors: [{ name: 'col-a', head: 'a1', behindTarget: 0 }, { name: 'col-dev', head: 'd1', behindTarget: 3 }],
    requests: [development],
  });
  const result = await coordinate(state, declaration({ candidates: ['col-a'] }));
  const sync = result.actions.find((a) => a.target === '#20');
  assert.ok(sync, 'the development sync yields no entry');
  assert.equal(sync.purpose, 'development', 'a sync into a collector that is not the candidate is not a development sync');
  const promotion = result.actions.find((a) => a.action === 'OPEN PR' && a.target === 'col-a' && a.kind === 'promotion');
  assert.ok(promotion, 'the promotion of the candidate is not offered while only a development sync is open');
  assert.equal(promotion.status, 'ready', 'the development sync blocks the promotion lane');
}
