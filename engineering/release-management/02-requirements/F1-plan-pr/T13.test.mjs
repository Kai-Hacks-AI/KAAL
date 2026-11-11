// Case release/T13 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T13';
export const tests = ['release/F1'];
export const title = 'a PLAN that declares no Cases fails because every required element has no outer-loop Case';
test(`${id} ${title}`, async () => {
  const result = await judge({
    intents: [{ id: 'release/I1' }],
    evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/I1' }],
  });
  assert.equal(result.verdict, 'FAIL');
  const finding = result.findings.find((f) => f.rule === 'F1/4' && f.id === 'release/I1');
  assert.ok(finding);
  assert.match(finding.recovery, /Add a Case that tests release\/I1/);
});
