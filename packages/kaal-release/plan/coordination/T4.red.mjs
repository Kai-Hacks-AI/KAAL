// Case coordination/T4 tests: F8
import assert from 'node:assert/strict';
import { byTarget, collector, analyzeFlow, declaration, facts, syncInto } from './fixtures.mjs';
export const id = 'coordination/T4';
export const tests = ['coordination/F8'];
export const title = 'the first incomplete declared pair is the only active pair: the next pair waits and gets no OPEN';
export async function run() {
  const state = facts({
    collectors: [collector('col-a', 2), collector('col-b', 1)],
    pieces: [syncInto(40, 'col-a', 'c/C1')],
  });
  const result = await analyzeFlow(state, declaration({ promotions: [{ collector: 'col-a', change: 'c/C1' }, { collector: 'col-b', change: 'c/C2' }] }));
  const sync = byTarget(result, '#40');
  assert.ok(sync, 'the open sync of the active pair yields no entry');
  assert.equal(sync.purpose, 'promotion', 'the sync of the active pair is not a promotion sync');
  assert.equal(sync.pair, 'col-a');
  const second = result.actions.filter((a) => a.pair === 'col-b');
  assert.ok(second.length > 0, 'the second pair is not shown');
  assert.ok(!second.some((a) => a.action === 'OPEN'), 'a second promotion sequence is opened while one is active');
  const wait = second.find((a) => a.action === 'WAIT');
  assert.ok(wait, 'the second pair does not WAIT');
  assert.match(String(wait.dependency), /col-a/, 'the wait does not name the pair it waits for');
  assert.equal(result.actions.filter((a) => a.layer === 'promotion' && a.status === 'ready').length >= 1, true, 'the active pair has no ready step');
  assert.ok(!result.actions.some((a) => a.pair === 'col-b' && a.status === 'ready'), 'a waiting pair has a ready step');
}
