// Case F1/T13 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T13';
export const tests = ['F1'];
export const title = 'an element id without its capability fails with a Recovery that names the form, and a capability-qualified plan is accepted';
export async function run({ judge }) {
  const unqualified = await judge({
    intents: [{ id: 'I1' }],
    requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }],
    cases: [{ id: 'I1/T1', tests: ['I1'] }, { id: 'F1/T1', tests: ['F1'] }],
    evidence: [{ case: 'F1/T1', result: 'failed', reason: 'assertion', target: 'F1' }],
  });
  assert.equal(unqualified.verdict, 'FAIL');
  const finding = unqualified.findings.find((f) => f.rule === 'F1/4' && f.id === 'F1');
  assert.ok(finding);
  assert.match(finding.recovery, /<capability>\/<kind><n>/);

  const qualified = await judge({
    intents: [{ id: 'release/I1' }],
    requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }],
    cases: [{ id: 'release/I1/T1', tests: ['release/I1'] }, { id: 'release/F1/T1', tests: ['release/F1'] }],
    evidence: [{ case: 'release/F1/T1', result: 'failed', reason: 'assertion', target: 'release/F1' }],
  });
  assert.equal(qualified.verdict, 'PASS');
}
