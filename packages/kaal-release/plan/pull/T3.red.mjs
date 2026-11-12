// Case pull/T3 tests: pull/F5
import assert from 'node:assert/strict';
import { collector, declaration, delivery, facts, flow, landed, promotion, pullPromotion, statuses } from './fixtures.mjs';
export const id = 'pull/T3';
export const tests = ['pull/F5'];
export const title = 'the increment is judged by the Change: what it carries must be landed in the collector since its last delivery; a missing piece is incomplete, an undeclared increment is not guessed';
export async function run() {
  const base = { declaration: declaration(), flow: flow() };
  const pass = await pullPromotion(facts({ pieces: [landed(10, 'DO'), promotion(20)] }), base.declaration, base.flow);
  assert.equal(statuses(pass).increment, 'PASS');

  // a carried type that has not landed is incomplete, named
  const wider = declaration({}, { increments: [{ collector: 'col-a', change: 'c/C1', carries: ['DO', 'PLAN'] }] });
  const incomplete = await pullPromotion(facts({ pieces: [landed(10, 'DO'), promotion(20)] }), wider, base.flow);
  const inc = incomplete.judgments.find((j) => j.id === 'increment');
  assert.equal(inc.status, 'FAIL', 'a missing PLAN is not incomplete');
  assert.match(inc.because, /PLAN/);
  assert.deepEqual(incomplete.increment.missing, ['PLAN']);
  assert.equal(incomplete.verdict, 'BLOCKED');

  // the increment is closed by its ACT: without it the work is not green and the learning not logged, so it is incomplete
  const unclosed = await pullPromotion(facts({ pieces: [landed(10, 'DO'), promotion(20)], noAct: true }), base.declaration, base.flow);
  assert.equal(statuses(unclosed).increment, 'FAIL', 'an increment without its ACT is complete');
  assert.deepEqual(unclosed.increment.missing, ['ACT']);
  assert.equal(unclosed.verdict, 'BLOCKED');
  const noClosing = await pullPromotion(facts({ pieces: [landed(10, 'DO'), promotion(20)] }), declaration({}, { closing: undefined }), base.flow);
  assert.equal(statuses(noClosing).increment, 'UNKNOWN', 'a declaration without the closing piece is guessed');

  // a piece of the Change still open into the collector: not everything has landed
  const open = landed(11, 'DO', { state: 'open', review: null });
  const notAll = await pullPromotion(facts({ pieces: [landed(10, 'DO'), open, promotion(20)] }), base.declaration, base.flow);
  assert.equal(statuses(notAll).increment, 'FAIL', 'an open piece of the Change does not block the increment');
  assert.match(notAll.judgments.find((j) => j.id === 'increment').because, /#11/);

  // a delivered piece does not count again: only what landed after the last delivery is the increment
  const after = await pullPromotion(
    facts({ pieces: [landed(10, 'DO', { landedAt: '2026-11-12T01:00:00Z' }), promotion(20)], deliveries: [delivery('col-a', 'older', { landedAt: '2026-11-12T05:00:00Z' })] }),
    base.declaration, base.flow);
  assert.equal(statuses(after).increment, 'FAIL', 'a piece delivered already is carried again');

  // nothing declared for the collector, or a landing time that is absent: unknown, not a guess
  const undeclared = await pullPromotion(facts({ pieces: [landed(10), promotion(20)] }), declaration({}, { increments: [] }), base.flow);
  assert.equal(statuses(undeclared).increment, 'UNKNOWN', 'an undeclared increment is guessed');
  const noTime = landed(10, 'DO'); delete noTime.landedAt;
  const untimed = await pullPromotion(facts({ pieces: [noTime, promotion(20)], deliveries: [delivery('col-a', 'older', { landedAt: '2026-11-12T05:00:00Z' })] }), base.declaration, base.flow);
  assert.equal(statuses(untimed).increment, 'UNKNOWN', 'a piece without a landing time is placed before or after a delivery by guess');
}
