// Case release/T1369 tests: release/C127
import assert from 'node:assert/strict';
import { LIB, JUDGE, rec, recs } from './evidence-fixtures.mjs';
export const id = 'release/T1369';
export const tests = ['release/C127'];
export const title = 'a count never makes a judge ready: ten plain PASSes reach the trigger and exercise no boundary, and a handled label on an open Defect is unresolved, not correct';
export async function run() {
  const { summarizeEvidence, reportOfSummary } = await import(LIB);
  const s = (ledger) => summarizeEvidence(ledger, JUDGE);
  const plain = s(recs(1, 10));
  assert.equal(plain.trigger.reached, true); assert.deepEqual(plain.exercised, { PASS: true, FAIL: false, UNKNOWN: false, provoked: false });
  assert.equal(plain.review.outcome, 'no review'); assert.doesNotMatch(reportOfSummary(plain), /READY/);
  const open = s([...recs(1, 9), rec(10, { verdict: 'FAIL', handled: { by: 'release/D99', open: true } })]);
  assert.equal(open.unresolved.length, 1); assert.equal(open.unresolved[0].pr, 10);
  const bare = s([...recs(1, 9), rec(10, { verdict: 'UNKNOWN' })]); assert.equal(bare.unresolved.length, 1);   // a non-PASS no one handled
  const closed = s([...recs(1, 9), rec(10, { verdict: 'FAIL', handled: { by: 'release/D99', open: false } })]); assert.equal(closed.unresolved.length, 0);
  assert.equal(closed.exercised.FAIL, true); assert.equal(closed.review.outcome, 'no review');
  const provoked = s([...recs(1, 9), rec(10, { verdict: 'FAIL', provoked: true, handled: { by: 'release/C127', open: false } })]); assert.equal(provoked.exercised.provoked, true);
  const notAct = s([...recs(1, 9), rec(10, { applies: false, verdict: 'PASS', provoked: true })]); assert.equal(notAct.exercised.provoked, false);   // a not-an-ACT run exercises nothing
}
