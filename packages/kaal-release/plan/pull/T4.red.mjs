// Case pull/T4 tests: pull/F6
import assert from 'node:assert/strict';
import { declaration, facts, flow, landed, promotion, pullPromotion, statuses } from './fixtures.mjs';
export const id = 'pull/T4';
export const tests = ['pull/F6'];
export const title = 'a complete Change, a complete increment and a ready collector are three different statements: an incomplete Change does not by itself block an increment';
export async function run() {
  // the increment carries its DO; the Change still lacks its PLAN and ACT on the target
  const partial = await pullPromotion(facts({ pieces: [landed(10, 'DO'), promotion(20)] }), declaration(), flow());
  assert.equal(statuses(partial).increment, 'PASS', 'an incomplete Change blocks a complete increment');
  assert.equal(partial.verdict, 'READY');
  assert.equal(partial.change.id, 'c/C1');
  assert.equal(partial.change.status, 'incomplete');
  assert.deepEqual(partial.change.missing, ['ACT', 'DO', 'PLAN'], 'the Change does not say what is missing on the target');

  // the pieces of the Change that landed on the target count; a piece that landed only in a collector does not
  const onTarget = [landed(1, 'PLAN', { into: 'main' }), landed(2, 'DO', { into: 'main' }), landed(3, 'ACT', { into: 'main' })];
  const done = await pullPromotion(facts({ pieces: [...onTarget, landed(10, 'DO'), promotion(20)] }), declaration(), flow());
  assert.equal(done.change.status, 'complete');
  assert.deepEqual(done.change.missing, []);

  // a Change that no declaration names is not judged, and is never called complete
  const stranger = await pullPromotion(facts({ pieces: [landed(10, 'DO'), promotion(20)] }), declaration({}, { changes: [] }), flow());
  assert.equal(stranger.change.status, 'not judged', 'an undeclared Change is called complete or incomplete');
  assert.equal(stranger.verdict, 'READY', 'an undeclared Change decides the collector');
}
