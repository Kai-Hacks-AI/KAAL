// Case coordination/T17 tests: F13
import assert from 'node:assert/strict';
import { byTarget, collector, analyzeFlow, declaration, delivery, facts, promotionOf } from './fixtures.mjs';
export const id = 'coordination/T17';
export const tests = ['coordination/F13'];
export const title = 'only a delivery of the collector\'s current version completes its pair; a collector that changed after a promotion is delivered again, a delivered version is not offered twice, and missing evidence is reported';
export async function run() {
  const two = declaration({ promotions: [{ collector: 'col-a', change: 'c/C1' }, { collector: 'col-b', change: 'c/C2' }] });
  const landed = promotionOf(30, 'col-a', { state: 'landed', at: 'col-a-v1' });

  // the collector moved on after the promotion: the older delivery does not complete the pair
  const moved = await analyzeFlow(facts({ collectors: [{ name: 'col-a', at: 'col-a-v2', behindTarget: 0 }, collector('col-b')], pieces: [landed], deliveries: [delivery('col-a', 'col-a-v1')] }), two);
  const again = moved.actions.find((a) => a.action === 'OPEN' && a.target === 'col-a' && a.kind === 'promotion');
  assert.ok(again, 'an older delivery falsely completes a pair whose collector changed');
  assert.equal(again.status, 'ready');
  assert.ok(!moved.actions.some((a) => a.pair === 'col-b' && a.status === 'ready'), 'the next pair is active while the first is not delivered');

  // the delivered version is not offered again, however often it is analyzed
  const state = facts({ collectors: [{ name: 'col-a', at: 'col-a-v1', behindTarget: 0 }, collector('col-b')], pieces: [landed], deliveries: [delivery('col-a', 'col-a-v1')] });
  for (let run = 0; run < 2; run += 1) {
    const result = await analyzeFlow(state, two);
    assert.ok(!result.actions.some((a) => a.target === 'col-a' || a.pair === 'col-a'), 'a delivered version is offered again');
  }

  // a landed promotion without its delivery evidence is reported, not guessed
  const unproven = await analyzeFlow(facts({ collectors: [collector('col-a'), collector('col-b')], pieces: [promotionOf(31, 'col-a', { state: 'landed' })], deliveries: [] }), two);
  assert.ok(unproven.notJudged.some((n) => /col-a/.test(n) && /deliver/i.test(n)), 'missing delivery evidence is not reported');
  assert.ok(!unproven.actions.some((a) => a.action === 'OPEN'), 'an action is guessed without delivery evidence');
  const wait = unproven.actions.find((a) => a.pair === 'col-b');
  assert.ok(wait, 'the next pair is not shown');
  assert.equal(wait.action, 'WAIT');
  assert.equal(wait.status, 'blocked', 'the next pair is not blocked on the missing evidence');
  assert.match(String(wait.dependency), /col-a/);

  // delivery evidence that names no delivered version is no evidence
  const empty = await analyzeFlow(facts({ collectors: [collector('col-a')], pieces: [promotionOf(32, 'col-a', { state: 'landed' })], deliveries: [{ collector: 'col-a', ref: '#32' }] }), declaration());
  assert.ok(empty.notJudged.some((n) => /col-a/.test(n) && /deliver/i.test(n)), 'a delivery without a delivered version is accepted');
  assert.ok(!byTarget(empty, 'col-a'), 'an action is guessed from a delivery without a delivered version');
}
