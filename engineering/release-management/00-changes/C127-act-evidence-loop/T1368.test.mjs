// Case release/T1368 tests: release/C127
import assert from 'node:assert/strict';
import { LIB, JUDGE, rec, recs } from './evidence-fixtures.mjs';
export const id = 'release/T1368';
export const tests = ['release/C127'];
export const title = 'the trigger counts runs on real ACT pull requests, distinct, with complete attribution: not-an-ACT runs and unobserved runs are recorded and count toward nothing, and a re-run counts once';
export async function run() {
  const { summarizeEvidence } = await import(LIB);
  const s = (ledger) => summarizeEvidence(ledger, JUDGE);
  const nine = s(recs(1, 9)); assert.equal(nine.counted, 9); assert.equal(nine.trigger.reached, false);
  const ten = s(recs(1, 10)); assert.equal(ten.counted, 10); assert.equal(ten.trigger.reached, true); assert.equal(ten.trigger.needed, 10);
  const notAct = s(recs(1, 10, { applies: false })); assert.equal(notAct.recorded, 10); assert.equal(notAct.counted, 0); assert.equal(notAct.notAnAct, 10); assert.equal(notAct.trigger.reached, false);
  const blind = s(recs(1, 10, { attribution: 'missing', verdict: 'UNKNOWN' })); assert.equal(blind.counted, 0); assert.equal(blind.unobserved, 10); assert.equal(blind.trigger.reached, false);
  const again = s([...recs(1, 9), rec(9, { run: 'r9b' })]); assert.equal(again.recorded, 9); assert.equal(again.counted, 9); assert.equal(again.trigger.reached, false);   // a re-run of pull request 9
  const unnamed = s(recs(1, 10, { pr: null })); assert.equal(unnamed.counted, 0);
  const other = summarizeEvidence([...recs(1, 10), { ...rec(99), judge: 'hold' }], JUDGE); assert.equal(other.recorded, 10);   // another judge's record is not this judge's
}
