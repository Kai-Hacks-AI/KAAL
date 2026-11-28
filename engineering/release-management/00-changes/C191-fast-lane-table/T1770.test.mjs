// Case release/T1770 tests: release/C191. Missing or malformed evidence of the existing files is never an empty inventory: a change that adds or modifies a file of a kind whose complete list of existing files is not given is UNKNOWN, and a refusal still stands.
import assert from 'node:assert/strict';
import { lanes, EMPTY, ITEM_ROOT, CLAIM_ROOT, add, mod, codes, load } from './fixture.mjs';
export const id = 'release/T1770';
export const tests = ['release/C191'];
export const title = 'a missing or malformed list of existing files for a kind the change lands in is UNKNOWN, never qualified, and each kind is judged on its own list';
export async function run() {
  const qualify = await load(import.meta.url);
  const one = [add(CLAIM_ROOT + 'K9.json')];
  for (const [why, existing] of [['undefined', undefined], ['null', null], ['a list instead of kinds', []], ['empty object', {}], ['the other kind only', { item: [] }], ['not a list', { claim: 'K9.json' }],
    ['null list', { claim: null }], ['a non-string entry', { claim: [CLAIM_ROOT + 'K1.json', 7] }], ['an object entry', { claim: [{}] }]]) {
    const r = qualify(one, { lanes, existing });
    assert.equal(r.verdict, 'unknown', why + ' was not unknown');
    assert.notEqual(r.verdict, 'qualified', why + ' must never qualify');
    assert.deepEqual(r.findings, [{ code: 'existing-unknown', kind: 'claim' }], why + ' names the kind');
  }
  // a kind the change does not land in needs no list; a kind it lands in needs its own
  assert.equal(qualify(one, { lanes, existing: { claim: [] } }).verdict, 'qualified', 'the other kind is not needed');
  const both = qualify([add(ITEM_ROOT + 'B1.md'), add(CLAIM_ROOT + 'K9.json')], { lanes, existing: { claim: [] } });
  assert.equal(both.verdict, 'unknown'); assert.deepEqual(both.findings, [{ code: 'existing-unknown', kind: 'item' }]);
  assert.equal(qualify([mod(ITEM_ROOT + 'B1.md')], { lanes }).verdict, 'unknown', 'an edit needs the list too');
  // evidence that is given and complete still judges: a collision is a refusal
  assert.equal(qualify(one, { lanes, existing: { claim: [CLAIM_ROOT + 'K1.json'] } }).verdict, 'qualified');
  // a refusal stands without any evidence
  const refused = qualify([add('.github/x.yml')], { lanes });
  assert.equal(refused.verdict, 'refused'); assert.ok(codes(refused).includes('outside-roots'));
  // nothing to land needs no evidence
  assert.equal(qualify([], { lanes }).verdict, 'nothing-to-land');
  assert.equal(qualify([add(CLAIM_ROOT + 'K9.json')], { lanes, existing: EMPTY }).verdict, 'qualified');
}
