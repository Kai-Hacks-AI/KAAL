// Case release/T12 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T12';
export const tests = ['release/F1'];
export const title = 'RED evidence counts only for a Case and target of the plan itself, whether the target is an element or a gap';
const plan = (evidence) => ({
  intents: [{ id: 'release/I1' }],
  changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G1'] }],
  gaps: [{ id: 'release/G1' }],
  cases: [{ id: 'release/T1', at: 'release/I1', tests: ['release/I1'] }, { id: 'release/T2', at: 'release/C1', tests: ['release/G1'] }],
  evidence,
});
const red = (caseId, target) => ({ case: caseId, result: 'failed', reason: 'assertion', target });
const f6 = (result) => result.findings.some((f) => f.rule === 'F1/6' && f.status === 'fail');
test(`${id} ${title}`, async () => {
  assert.ok(f6(await judge(plan([red('release/T1', 'X99')]))), 'unknown Case and target');
  assert.ok(f6(await judge(plan([red('release/T1', 'release/G1')]))), 'target not tested by that Case');
  assert.ok(!f6(await judge(plan([red('release/T1', 'release/I1')]))), 'element target');
  assert.ok(!f6(await judge(plan([red('release/T2', 'release/G1')]))), 'gap target');
  const result = await judge(plan([red('release/T1', 'X99')]));
  assert.notEqual(result.verdict, 'PASS');
  assert.match(result.findings.find((f) => f.rule === 'F1/6').recovery, /release\/T1/);
});
