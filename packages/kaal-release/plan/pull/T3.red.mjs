// Case pull/T3 tests: pull/F5
import assert from 'node:assert/strict';
import { declaration, delivery, facts, flow, landed, lifecycle, promotion, pullPromotion, statuses } from './fixtures.mjs';
export const id = 'pull/T3';
export const tests = ['pull/F5'];
export const title = 'every Change in the collector must have completed its lifecycle in that collector since its last delivery: a missing PLAN, DO or ACT is incomplete and named; nothing is borrowed from another collector or from the target';
export async function run() {
  const base = { declaration: declaration(), flow: flow() };
  const pass = await pullPromotion(facts({ pieces: [...lifecycle(), promotion(20)] }), base.declaration, base.flow);
  assert.equal(statuses(pass).lifecycle, 'PASS');
  assert.deepEqual(pass.changes.map((c) => [c.id, c.status]), [['c/C1', 'complete']]);

  // each phase is needed; the ACT closes the lifecycle (the work is green, the learning is logged)
  for (const [type, pieces] of [['ACT', lifecycle().filter((p) => p.type !== 'ACT')], ['PLAN', lifecycle().filter((p) => p.type !== 'PLAN')], ['DO', lifecycle().filter((p) => p.type !== 'DO')]]) {
    const result = await pullPromotion(facts({ pieces: [...pieces, promotion(20)] }), base.declaration, base.flow);
    const j = result.judgments.find((x) => x.id === 'lifecycle');
    assert.equal(j.status, 'FAIL', `a Change without its ${type} is complete`);
    assert.match(j.because, new RegExp(`c/C1.*${type}`), `the missing ${type} is not named with its Change`);
    assert.deepEqual(result.changes[0].missing, [type]);
    assert.equal(result.changes[0].status, 'incomplete');
    assert.equal(result.verdict, 'BLOCKED');
  }

  // nothing is borrowed: a piece that landed in another collector or on the target does not complete this one
  const borrowed = await pullPromotion(facts({ pieces: [landed(10, 'PLAN', { into: 'col-b' }), landed(11, 'DO'), landed(12, 'ACT', { into: 'main' }), promotion(20)] }), base.declaration, base.flow);
  assert.equal(statuses(borrowed).lifecycle, 'FAIL', 'a piece of another collector completes the Change');
  assert.deepEqual(borrowed.changes[0].missing, ['ACT', 'PLAN']);

  // one Change in the collector that is incomplete blocks the collector, however complete the others
  const two = await pullPromotion(facts({ pieces: [...lifecycle(), ...lifecycle({}, 40, 'c/C2').filter((p) => p.type !== 'ACT'), promotion(20)] }), base.declaration, base.flow);
  assert.deepEqual(two.changes.map((c) => [c.id, c.status]), [['c/C1', 'complete'], ['c/C2', 'incomplete']]);
  assert.equal(two.verdict, 'BLOCKED');

  // a piece of the Change still open into the collector: not everything has landed
  const open = landed(13, 'DO', { state: 'open', review: null });
  const notAll = await pullPromotion(facts({ pieces: [...lifecycle(), open, promotion(20)] }), base.declaration, base.flow);
  assert.equal(statuses(notAll).lifecycle, 'FAIL', 'an open piece of the Change does not block');
  assert.match(notAll.judgments.find((j) => j.id === 'lifecycle').because, /#13/);

  // a delivered piece does not count again: only what landed after the last delivery is in the collector now
  const old = lifecycle().map((p) => ({ ...p, landedAt: '2026-11-12T01:00:00Z' }));
  const after = await pullPromotion(facts({ pieces: [...old, promotion(20)], deliveries: [delivery('col-a', 'older', { landedAt: '2026-11-12T05:00:00Z' })] }), base.declaration, base.flow);
  assert.deepEqual(after.changes, [], 'a delivered Change is offered again');
  assert.equal(statuses(after).lifecycle, 'UNKNOWN', 'a collector holding nothing since its delivery is judged ready');

  // an absent landing time, or no lifecycle declared: unknown, never a guess
  const untimed = lifecycle(); delete untimed[1].landedAt;
  const noTime = await pullPromotion(facts({ pieces: [...untimed, promotion(20)], deliveries: [delivery('col-a', 'older', { landedAt: '2026-11-12T05:00:00Z' })] }), base.declaration, base.flow);
  assert.equal(statuses(noTime).lifecycle, 'UNKNOWN', 'a piece without a landing time is placed against a delivery by guess');
  const noLifecycle = await pullPromotion(facts({ pieces: [...lifecycle(), promotion(20)] }), declaration({}, { lifecycle: undefined }), base.flow);
  assert.equal(statuses(noLifecycle).lifecycle, 'UNKNOWN', 'a declaration without a lifecycle is guessed');
}
