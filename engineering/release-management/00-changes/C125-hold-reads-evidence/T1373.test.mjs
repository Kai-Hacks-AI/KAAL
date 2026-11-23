// Case release/T1373 tests: release/C125
import assert from 'node:assert/strict';
import { use, changes, retros, evidenceOf } from './evidence-fixtures.mjs';
export const id = 'release/T1373';
export const tests = ['release/C125'];
export const title = 'hold Act does not pass on a catalog that is not exactly complete: every Case GREEN with an incomplete catalog is UNKNOWN naming the findings, a RED stays a FAIL, and a complete catalog passes';
export async function run() {
  const { judgeHoldWithEvidence } = await use('judge-act.mjs');
  const ask = (evidence) => judgeHoldWithEvidence({ changes, retros, evidence });
  const ok = ask(evidenceOf()); assert.equal(ok.verdict, 'PASS'); assert.equal(ok.applies, true);
  for (const complete of [false, undefined, null, 'true', 1]) {
    const r = ask(evidenceOf({ complete, findings: [{ kind: 'duplicate-id', id: 'x/T9' }], unobservable: ['a/T7.test.mjs'] }));
    assert.equal(r.verdict, 'UNKNOWN', `complete ${String(complete)}`); assert.equal(r.applies, true);
    assert.match(r.message, /catalog of Cases is not complete \(duplicate-id x\/T9, unobservable a\/T7\.test\.mjs\)/);
  }
  const red = ask(evidenceOf({ complete: false, observed: { 'x/T1': 'GREEN', 'x/T2': 'RED' } }));
  assert.equal(red.verdict, 'FAIL'); assert.match(red.message, /x\/T2/);      // incompleteness never turns a red Case into UNKNOWN
  const unseen = ask(evidenceOf({ observed: { 'x/T1': 'GREEN' } })); assert.equal(unseen.verdict, 'UNKNOWN');   // an applicable Case missing from the map
}
