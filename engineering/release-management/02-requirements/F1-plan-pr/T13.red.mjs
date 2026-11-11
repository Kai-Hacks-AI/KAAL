// Case F1/T13 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T13';
export const tests = ['F1'];
export const title = 'an id without its capability, or a Case id that encodes a place, fails with a Recovery that names the form, and a plan with capability-qualified ids is accepted';
export async function run({ judge }) {
  const unqualified = await judge({
    intents: [{ id: 'I1' }],
    requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }],
    cases: [{ id: 'I1/T1', at: 'I1', tests: ['I1'] }, { id: 'F1/T1', at: 'F1', tests: ['F1'] }],
    evidence: [{ case: 'F1/T1', result: 'failed', reason: 'assertion', target: 'F1' }],
  });
  assert.equal(unqualified.verdict, 'FAIL');
  const finding = unqualified.findings.find((f) => f.rule === 'F1/4' && f.id === 'F1');
  assert.ok(finding);
  assert.match(finding.recovery, /<capability>\/<kind><n>/);

  const encoded = await judge({
    intents: [{ id: 'release/I1' }],
    cases: [{ id: 'release/I1/T1', at: 'release/I1', tests: ['release/I1'] }],
    evidence: [{ case: 'release/I1/T1', result: 'failed', reason: 'assertion', target: 'release/I1' }],
  });
  assert.ok(encoded.findings.some((f) => f.rule === 'F1/4' && f.id === 'release/I1/T1'));

  const qualified = await judge({
    intents: [{ id: 'release/I1' }],
    requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }],
    cases: [{ id: 'release/T1', at: 'release/I1', tests: ['release/I1'] }, { id: 'release/T2', at: 'release/F1', tests: ['release/F1'] }],
    evidence: [{ case: 'release/T2', result: 'failed', reason: 'assertion', target: 'release/F1' }],
  });
  assert.equal(qualified.verdict, 'PASS');
}
