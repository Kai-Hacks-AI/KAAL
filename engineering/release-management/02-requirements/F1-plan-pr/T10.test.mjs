// Case release/T10 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T10';
export const tests = ['release/F1'];
export const title = 'a Case with no observed place, or one the plan does not declare, never passes and the Recovery asks to read its folder';
test(`${id} ${title}`, async () => {
  const result = await judge({
    intents: [{ id: 'release/I1' }],
    cases: [{ id: 'release/T1', tests: ['release/I1'] }],
    evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/I1' }],
  });
  assert.notEqual(result.verdict, 'PASS');
  const finding = result.findings.find((f) => f.rule === 'F1/5' && f.id === 'release/T1');
  assert.ok(finding);
  assert.equal(finding.status, 'unknown');
  assert.match(finding.recovery, /Read the folder of Case release\/T1/);
  const undeclared = await judge({
    intents: [{ id: 'release/I1' }],
    cases: [{ id: 'release/T1', found: 'release/F9', tests: ['release/I1'] }],
    evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/I1' }],
  });
  assert.notEqual(undeclared.verdict, 'PASS');
  assert.equal(undeclared.findings.find((f) => f.rule === 'F1/5').status, 'unknown');
});
