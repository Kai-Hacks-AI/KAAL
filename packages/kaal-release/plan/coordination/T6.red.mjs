// Case coordination/T6 tests: F8
import assert from 'node:assert/strict';
import { collector, analyzeFlow, declaration, facts, promotionOf } from './fixtures.mjs';
export const id = 'coordination/T6';
export const tests = ['coordination/F8'];
export const title = 'a landed promotion completes its pair and releases the lane; the next pair becomes active; a surviving collector is not offered again';
export async function run() {
  const state = facts({
    collectors: [collector('col-a'), collector('col-b')],
    pieces: [promotionOf(30, 'col-a', { state: 'landed' })],
  });
  const result = await analyzeFlow(state, declaration({ promotions: [{ collector: 'col-a', change: 'c/C1' }, { collector: 'col-b', change: 'c/C2' }] }));
  assert.equal(result.actions.filter((a) => a.target === 'col-a' || a.pair === 'col-a').length, 0, 'a pair whose promotion landed is offered again');
  const next = result.actions.find((a) => a.action === 'OPEN' && a.target === 'col-b' && a.kind === 'promotion');
  assert.ok(next, 'the next pair is not offered after the promotion landed');
  assert.equal(next.status, 'ready', 'the lane is not released by a landed promotion');
}
