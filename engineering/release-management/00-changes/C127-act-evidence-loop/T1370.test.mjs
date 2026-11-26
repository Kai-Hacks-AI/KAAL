// Case release/T1370 tests: release/C127
import assert from 'node:assert/strict';
import { LIB, JUDGE, rec, recs, review } from './evidence-fixtures.mjs';
export const id = 'release/T1370';
export const tests = ['release/C127'];
export const title = 'expected and observed are compared run by run, a review entry carries the outcome and the next trigger, and only a review of a person sets an outcome';
export async function run() {
  const { summarizeEvidence, reportOfSummary } = await import(LIB);
  const s = (ledger) => summarizeEvidence(ledger, JUDGE);
  const checked = s([...recs(1, 8, { expected: 'PASS', facts: 'engineering/x/00-changes' }), rec(9, { expected: 'FAIL', facts: 'pull request 9 changes a folder the ACT may not write' }), rec(10)]);
  assert.deepEqual(checked.mismatches, [{ pr: 9, run: 'r9', expected: 'FAIL', observed: 'PASS' }]);
  assert.equal(checked.unchecked, 1);   // run 10 names no expected verdict yet
  const ledger = [...recs(1, 10, { expected: 'PASS' }), review('MORE EVIDENCE NEEDED', { nextTrigger: 'five more runs that include a FAIL' })];
  const reviewed = s(ledger); assert.equal(reviewed.review.outcome, 'MORE EVIDENCE NEEDED'); assert.equal(reviewed.review.nextTrigger, 'five more runs that include a FAIL');
  assert.match(reportOfSummary(reviewed), /review MORE EVIDENCE NEEDED; next trigger five more runs/);
  assert.equal(s([...recs(1, 10), review('READY', { judge: 'hold' })]).review.outcome, 'no review');   // another judge's review
  assert.equal(s([...recs(1, 10), review('WELL ENOUGH')]).review.outcome, 'no review');               // not an outcome
  assert.equal(s([...ledger, review('READY')]).review.outcome, 'READY');                               // the latest review stands
}
