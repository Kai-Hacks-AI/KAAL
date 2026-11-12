// Case coordination/T4 tests: F7
import assert from 'node:assert/strict';
import { coordinate, declaration, facts, request } from './fixtures.mjs';
export const id = 'coordination/T4';
export const tests = ['coordination/F7'];
export const title = 'an open promotion sync occupies the promotion lane: the next candidate waits and gets no OPEN PR';
export async function run() {
  const open = request(40, { title: 'SYNC: Prepare promotion', base: 'col-a', head: 'work-a', review: null, autoMerge: false });
  const state = facts({
    collectors: [{ name: 'col-a', head: 'a1', behindTarget: 2 }, { name: 'col-b', head: 'b1', behindTarget: 1 }],
    requests: [open],
  });
  const result = await coordinate(state, declaration({ candidates: ['col-a', 'col-b'] }));
  const sync = result.actions.find((a) => a.target === '#40');
  assert.ok(sync, 'the open sync yields no entry');
  assert.equal(sync.purpose, 'promotion', 'a sync into the declared candidate is not a promotion sync');
  const second = result.actions.filter((a) => a.target === 'col-b');
  assert.ok(second.length > 0, 'the second candidate is not shown');
  assert.ok(!second.some((a) => a.action === 'OPEN PR'), 'a second promotion sequence is opened while one is in flight');
  const wait = second.find((a) => a.action === 'WAIT');
  assert.ok(wait, 'the second candidate does not WAIT');
  assert.match(String(wait.dependency), /col-a/, 'the wait does not name the pair it waits for');
}
