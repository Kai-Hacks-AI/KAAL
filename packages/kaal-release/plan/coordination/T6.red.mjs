// Case coordination/T6 tests: F8, F13
import assert from 'node:assert/strict';
import { collector, analyzeFlow, declaration, delivery, facts, promotionOf } from './fixtures.mjs';
export const id = 'coordination/T6';
export const tests = ['coordination/F8', 'coordination/F13'];
export const title = 'a landed promotion with its delivery evidence completes its pair and releases the lane; the next pair becomes active; a delivered version is not offered again';
export async function run() {
  const state = facts({
    collectors: [collector('col-a'), collector('col-b')],
    pieces: [promotionOf(30, 'col-a', { state: 'landed' })],
    deliveries: [delivery('col-a', 'col-a-head')],
  });
  const result = await analyzeFlow(state, declaration({ promotions: [{ collector: 'col-a', change: 'c/C1' }, { collector: 'col-b', change: 'c/C2' }] }));
  assert.equal(result.actions.filter((a) => a.target === 'col-a' || a.pair === 'col-a').length, 0, 'a delivered version is offered again');
  const next = result.actions.find((a) => a.action === 'OPEN' && a.target === 'col-b' && a.kind === 'promotion');
  assert.ok(next, 'the next pair is not offered after the delivery');
  assert.equal(next.status, 'ready', 'the lane is not released by a delivery');
}
