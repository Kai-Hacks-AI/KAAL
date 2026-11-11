// Case F1/T9 tests: F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'F1/T9';
export const tests = ['F1'];
export const title = 'a Case whose identity places it under an undeclared element never passes and the Recovery names the placement';
test(`${id} ${title}`, async () => {
  const result = await judge({
    intents: [{ id: 'I1' }],
    cases: [{ id: 'C99/T1', tests: ['I1'] }],
    evidence: [{ case: 'C99/T1', result: 'failed', reason: 'assertion', target: 'I1' }],
  });
  assert.notEqual(result.verdict, 'PASS');
  const finding = result.findings.find((f) => f.rule === 'F1/5' && f.id === 'C99/T1');
  assert.ok(finding);
  assert.equal(finding.status, 'unknown');
  assert.match(finding.recovery, /Place Case C99\/T1/);
});
