// Case F1/T12 tests: F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'F1/T12';
export const tests = ['F1'];
export const title = 'a PLAN that declares no Cases fails because every required element has no outer-loop Case';
test(`${id} ${title}`, async () => {
  const result = await judge({
    intents: [{ id: 'I1' }],
    evidence: [{ case: 'I1/T1', result: 'failed', reason: 'assertion', target: 'I1' }],
  });
  assert.equal(result.verdict, 'FAIL');
  const finding = result.findings.find((f) => f.rule === 'F1/4' && f.id === 'I1');
  assert.ok(finding);
  assert.match(finding.recovery, /Add a Case that tests I1/);
});
