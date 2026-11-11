// Case release/T14 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T14';
export const tests = ['release/F1'];
export const title = 'an element id without its capability, or a Case id that encodes a place, fails with a Recovery that names the form, and a plan with capability-qualified ids is accepted';
test(`${id} ${title}`, async () => {
  const unqualified = await judge({
    intents: [{ id: 'I1' }],
    requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }],
    cases: [{ id: 'T1', found: 'I1', tests: ['I1'] }, { id: 'T2', found: 'F1', tests: ['F1'] }],
    evidence: [{ case: 'T2', result: 'failed', reason: 'assertion', target: 'F1' }],
  });
  assert.equal(unqualified.verdict, 'FAIL');
  const finding = unqualified.findings.find((f) => f.rule === 'F1/4' && f.id === 'F1');
  assert.ok(finding);
  assert.match(finding.recovery, /<capability>\/<kind><n>/);

  const encoded = await judge({
    intents: [{ id: 'release/I1' }],
    cases: [{ id: 'release/I1/T1', found: 'release/I1', tests: ['release/I1'] }],
    evidence: [{ case: 'release/I1/T1', result: 'failed', reason: 'assertion', target: 'release/I1' }],
  });
  assert.ok(encoded.findings.some((f) => f.rule === 'F1/4' && f.id === 'release/I1/T1'));

  const qualified = await judge({
    intents: [{ id: 'release/I1' }],
    requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }],
    cases: [{ id: 'release/T1', found: 'release/I1', tests: ['release/I1'] }, { id: 'release/T2', found: 'release/F1', tests: ['release/F1'] }],
    evidence: [{ case: 'release/T2', result: 'failed', reason: 'assertion', target: 'release/F1' }],
  });
  assert.equal(qualified.verdict, 'PASS');
});
