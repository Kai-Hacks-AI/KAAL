// Case coordination/T13 tests: F6, F8, F10
import assert from 'node:assert/strict';
import { byTarget, collector, coordinate, declaration, facts, promotionOf, syncInto } from './fixtures.mjs';
export const id = 'coordination/T13';
export const tests = ['coordination/F6', 'coordination/F8', 'coordination/F10'];
export const title = 'the sequence of 12 Nov (promotion 1440, then sync 1430, then promotion 1428) is listed in that order, one active pair at a time, and advances when 1440 merges';
export async function run() {
  const pairs = [{ collector: 'col-act', change: 'rm/C6' }, { collector: 'col-do', change: 'rm/C7' }];
  const collectors = [collector('col-act'), collector('col-do', 1)];
  const open = [promotionOf(1440, 'col-act', { change: 'rm/C6', review: null }), syncInto(1430, 'col-do', 'rm/C7'), promotionOf(1428, 'col-do', { change: 'rm/C7', review: null })];
  const before = await coordinate(facts({ collectors, requests: open }), declaration({ promotions: pairs }));
  assert.equal(byTarget(before, '#1440').action, 'REVIEW PR', 'the active promotion is not reviewed first');
  assert.equal(byTarget(before, '#1440').authority, 'reviewer');
  assert.equal(byTarget(before, '#1440').status, 'ready');
  assert.equal(byTarget(before, '#1430').action, 'WAIT', 'the next sync does not wait for the active promotion');
  assert.match(String(byTarget(before, '#1430').dependency), /#1440/);
  assert.equal(byTarget(before, '#1430').purpose, 'promotion');
  assert.equal(byTarget(before, '#1428').action, 'WAIT', 'the second open promotion becomes a competing active pair');
  assert.match(String(byTarget(before, '#1428').dependency), /#1430/);
  const order = [1440, 1430, 1428].map((n) => byTarget(before, `#${n}`).rank);
  assert.deepEqual(order, [...order].sort((a, b) => a - b), 'the entries are not listed 1440, 1430, 1428');
  assert.equal(before.actions.filter((a) => a.layer === 'promotion' && a.status === 'ready').length, 1, 'more than one promotion step is ready');

  const merged = promotionOf(1440, 'col-act', { change: 'rm/C6', state: 'merged' });
  const after = await coordinate(facts({ collectors, requests: [merged, open[1], open[2]] }), declaration({ promotions: pairs }));
  assert.ok(!byTarget(after, '#1440'), 'a merged promotion is still listed');
  assert.equal(byTarget(after, '#1430').action, 'REVIEW PR', 'the sync does not become the next step when 1440 merges');
  assert.equal(byTarget(after, '#1430').status, 'ready');
  assert.equal(byTarget(after, '#1428').action, 'WAIT', 'the promotion does not wait for its sync');
  assert.match(String(byTarget(after, '#1428').dependency), /#1430/);
}
