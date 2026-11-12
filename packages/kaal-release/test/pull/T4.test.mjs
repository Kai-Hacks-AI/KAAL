// Case pull/T4 tests: pull/F6
import assert from 'node:assert/strict';
import { declaration, facts, flow, landed, lifecycle, promotion, pullPromotion, statuses } from './fixtures.mjs';
export const id = 'pull/T4';
export const tests = ['pull/F6'];
export const title = 'there is no partial promotion: a Change that is incomplete in its collector makes the collector not ready, however much of it landed; legacy Changes are identified, not excused';
export async function run() {
  // a Change with its DO and nothing else is not promotable by declaring that the DO is "what this promotion carries"
  const partial = await pullPromotion(facts({ pieces: [landed(11, 'DO'), promotion(20)] }), declaration({}, { carries: ['DO'] }), flow());
  assert.equal(partial.verdict, 'BLOCKED', 'a partial Change is promotable');
  assert.equal(partial.changes[0].status, 'incomplete');
  assert.deepEqual(partial.changes[0].missing, ['ACT', 'PLAN']);
  assert.ok(!('increment' in partial), 'the result still speaks of a delivery increment');

  // a Change that spans collectors is a legacy record (a rule of 12 Nov: separate Changes instead); it stays incomplete here
  const spans = [landed(10, 'PLAN', { into: 'col-b' }), landed(11, 'DO'), promotion(20)];
  const legacy = declaration({}, { legacy: [{ change: 'c/C1', reason: 'predates the one-collector rule: its PLAN sits in col-b' }] });
  const result = await pullPromotion(facts({ pieces: spans }), legacy, flow());
  assert.equal(result.verdict, 'BLOCKED', 'a legacy Change is treated as compliant');
  assert.equal(result.changes[0].legacy, true);
  assert.match(result.changes[0].legacyReason, /one-collector rule/);
  assert.equal(statuses(result).lifecycle, 'FAIL');

  // a legacy flag never turns a failure into a pass, and a Change that is not legacy carries no flag
  const plain = await pullPromotion(facts({ pieces: spans }), declaration(), flow());
  assert.ok(!plain.changes[0].legacy, 'an undeclared Change is called legacy');
  const clean = await pullPromotion(facts({ pieces: [...lifecycle(), promotion(20)] }), legacy, flow());
  assert.equal(clean.changes[0].legacy, true, 'a declared legacy Change loses its flag once complete');
  assert.equal(statuses(clean).lifecycle, 'PASS');
}
