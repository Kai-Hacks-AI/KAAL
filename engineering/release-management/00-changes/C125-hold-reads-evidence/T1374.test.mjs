// Case release/T1374 tests: release/C125
import assert from 'node:assert/strict';
import { use, changes, retros, evidenceOf } from './evidence-fixtures.mjs';
export const id = 'release/T1374';
export const tests = ['release/C125'];
export const title = 'hold Act reads nothing from evidence that is missing, not the contracted shape or of another revision: UNKNOWN, a RED in it included, and no ACT to hold passes without evidence';
export async function run() {
  const { judgeHoldWithEvidence } = await use('judge-act.mjs');
  const ask = (evidence, r = retros) => judgeHoldWithEvidence({ changes, retros: r, evidence });
  const unknown = (r, re) => { assert.equal(r.verdict, 'UNKNOWN'); assert.equal(r.applies, true); assert.match(r.message, re); };
  unknown(ask(undefined), /not available/);
  for (const bad of [null, 'a string', 7, [], {}, { observed: [] , evidence: {} }, { observed: {}, evidence: {} }, { observed: null, evidence: { catalog: {} } }]) unknown(ask(bad), /available|shape the contract names/);
  const stale = evidenceOf({ revision: 'abc', expectedRevision: 'def', observed: { 'x/T1': 'RED', 'x/T2': 'GREEN' } }); unknown(ask(stale), /not for this revision/);   // stale evidence is no evidence: its RED is not read
  for (const [revision, expectedRevision] of [[undefined, 'abc'], ['abc', undefined], ['', ''], [7, 7]]) unknown(ask(evidenceOf({ revision, expectedRevision })), /not for this revision/);
  const none = ask(undefined, []); assert.equal(none.verdict, 'PASS'); assert.equal(none.applies, false);   // no retro reflects a carried Change: nothing is held, whatever the evidence
  assert.equal(ask(evidenceOf(), [{ reflects: ['other/C9'] }]).applies, false);
}
