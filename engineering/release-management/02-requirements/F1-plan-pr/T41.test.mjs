// Case release/T41 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T41';
export const tests = ['release/F1'];
export const title = 'a Case obeys the parent rules like every element, and a Case never tests a Case';
const plan = (extra) => ({
  intents: [{ id: 'release/I1' }],
  cases: [{ id: 'release/T1', at: 'release/I1', tests: ['release/I1'], ...extra }],
  evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/I1' }],
});
test(`${id} ${title}`, async () => {
  assert.equal((await judge(plan({}))).verdict, 'PASS');
  const missing = await judge(plan({ parent: 'release/T99' }));
  assert.equal(missing.verdict, 'FAIL');
  assert.ok(missing.findings.some((f) => f.rule === 'F1/3' && f.id === 'release/T1'));
  const cycle = await judge(plan({ parent: 'release/T1' }));
  assert.equal(cycle.verdict, 'FAIL');
  assert.ok(cycle.findings.some((f) => f.rule === 'F1/3' && f.id === 'release/T1'));
  const wrongKind = await judge(plan({ parent: 'release/I1' }));
  assert.ok(wrongKind.findings.some((f) => f.rule === 'F1/3' && f.id === 'release/T1'));
  const caseTarget = await judge({
    intents: [{ id: 'release/I1' }],
    cases: [{ id: 'release/T1', at: 'release/I1', tests: ['release/I1'] }, { id: 'release/T2', at: 'release/T1', tests: ['release/T1'] }],
    evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/I1' }],
  });
  assert.equal(caseTarget.verdict, 'FAIL');
  assert.ok(caseTarget.findings.some((f) => f.rule === 'F1/4' && f.id === 'release/T2' && /never references a Case/.test(f.recovery)));
});
