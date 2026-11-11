// Case F1/T11 tests: F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'F1/T11';
export const tests = ['F1'];
export const title = 'RED evidence counts only for a Case and target of the plan itself, whether the target is an element or a gap';
const plan = (evidence) => ({
  intents: [{ id: 'I1' }],
  changes: [{ id: 'C1', implements: ['I1'], gaps: ['C1/G1'] }],
  cases: [{ id: 'I1/T1', tests: ['I1'] }, { id: 'C1/T1', tests: ['C1/G1'] }],
  evidence,
});
const red = (caseId, target) => ({ case: caseId, result: 'failed', reason: 'assertion', target });
const f6 = (result) => result.findings.some((f) => f.rule === 'F1/6' && f.status === 'fail');
test(`${id} ${title}`, async () => {
  assert.ok(f6(await judge(plan([red('X/T99', 'X99')]))), 'unknown Case and target');
  assert.ok(f6(await judge(plan([red('I1/T1', 'C1/G1')]))), 'target not tested by that Case');
  assert.ok(!f6(await judge(plan([red('I1/T1', 'I1')]))), 'element target');
  assert.ok(!f6(await judge(plan([red('C1/T1', 'C1/G1')]))), 'gap target');
  const result = await judge(plan([red('X/T99', 'X99')]));
  assert.notEqual(result.verdict, 'PASS');
  assert.match(result.findings.find((f) => f.rule === 'F1/6').recovery, /I1\/T1/);
});
