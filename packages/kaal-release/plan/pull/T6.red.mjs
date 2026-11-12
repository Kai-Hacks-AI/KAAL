// Case pull/T6 tests: pull/F8
import assert from 'node:assert/strict';
import { collector, declaration, delivery, facts, flow, landed, promotion, pullPromotion, statuses } from './fixtures.mjs';
export const id = 'pull/T6';
export const tests = ['pull/F8'];
export const title = 'sequencing is Release\'s: a collector behind the target is not ready, an unknown distance is unknown, and whose turn it is comes from analyze Flow\'s lane and never changes the verdict';
export async function run() {
  const run = (over = {}, flowOver = {}) => pullPromotion(facts({ pieces: [landed(10), promotion(20)], ...over }), declaration(), flow(flowOver));

  const behind = await run({ collectors: [collector('col-a', { behindTarget: 3 })] });
  assert.equal(behind.judgments.find((j) => j.id === 'sequencing').status, 'FAIL', 'a collector behind the target is ready');
  assert.match(behind.judgments.find((j) => j.id === 'sequencing').because, /behind/i);
  assert.equal(behind.verdict, 'BLOCKED');

  const unknown = await run({ collectors: [{ name: 'col-a', at: 'col-a-head' }] });
  assert.equal(statuses(unknown).sequencing, 'UNKNOWN', 'an unknown distance to the target passes');

  // a wiring collector follows its capability: ready only once the collector it comes `after` has been delivered at its current version
  const wiring = declaration({}, { increments: [{ collector: 'col-a', change: 'c/C1', carries: ['DO'], after: ['col-x'] }] });
  const withX = (deliveries) => facts({ collectors: [collector('col-a'), collector('col-x')], pieces: [landed(10), promotion(20)], deliveries });
  const first = await pullPromotion(withX([]), wiring, flow());
  assert.equal(statuses(first).sequencing, 'FAIL', 'a wiring is ready before its capability is delivered');
  assert.match(first.judgments.find((j) => j.id === 'sequencing').because, /col-x/);
  assert.deepEqual(first.judgments.find((j) => j.id === 'sequencing').evidence, ['col-x']);
  const stale = await pullPromotion(withX([delivery('col-x', 'older')]), wiring, flow());
  assert.equal(statuses(stale).sequencing, 'FAIL', 'an older delivery of the capability completes the wiring');
  const done = await pullPromotion(withX([delivery('col-x', 'col-x-head')]), wiring, flow());
  assert.equal(statuses(done).sequencing, 'PASS', 'a delivered capability does not release the wiring');
  const unknownX = await pullPromotion(facts({ collectors: [collector('col-a')], pieces: [landed(10), promotion(20)] }), wiring, flow());
  assert.equal(statuses(unknownX).sequencing, 'UNKNOWN', 'a capability collector that is not in the facts passes');

  // the turn: the verdict is the same whether or not the lane is free
  const active = await run();
  const waiting = await run({}, { lane: { active: 'col-b' } });
  const missing = await run({}, { lane: undefined });
  assert.equal(active.verdict, 'READY');
  assert.equal(waiting.verdict, 'READY', 'a busy lane makes the collector not ready');
  assert.equal(active.turn.status, 'active');
  assert.equal(waiting.turn.status, 'waiting');
  assert.equal(waiting.turn.on, 'col-b');
  assert.equal(missing.turn.status, 'not judged', 'a missing lane is read as free or as busy');
  assert.equal(missing.verdict, 'READY', 'a missing lane changes the verdict');
}
