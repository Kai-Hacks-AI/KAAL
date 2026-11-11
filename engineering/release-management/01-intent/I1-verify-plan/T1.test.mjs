// Case I1/T1 tests: I1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'I1/T1';
export const tests = ['I1'];
export const title = 'a PLAN without a traced red plan is not accepted';
const valid = {
  intents: [{ id: 'I1' }],
  defects: [{ id: 'D1' }],
  requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }],
  architecture: [{ id: 'A1', addresses: ['F1', 'D1'] }],
  changes: [{ id: 'C1', implements: ['I1'], resolves: ['D1'], gaps: ['C1/G1'] }],
  cases: [
    { id: 'I1/T1', tests: ['I1'] },
    { id: 'F1/T1', tests: ['F1'] },
    { id: 'A1/T1', tests: ['A1'] },
    { id: 'D1/T1', tests: ['D1'] },
    { id: 'C1/T1', tests: ['C1/G1'] },
  ],
  evidence: [{ case: 'F1/T1', result: 'failed', reason: 'assertion', target: 'F1' }],
};
const untraced = {
  changes: [{ id: 'C9', implements: [], resolves: [] }],
  requirements: [{ id: 'F9', kind: 'F', serves: [] }],
  architecture: [{ id: 'A9', addresses: [] }],
  cases: [],
  evidence: [{ case: 'F9/T1', result: 'failed', reason: 'assertion', target: 'F9' }],
};
test(`${id} ${title}`, async () => {
  assert.equal((await judge(valid)).verdict, 'PASS');
  const result = await judge(untraced);
  assert.equal(result.verdict, 'FAIL');
  assert.ok(result.findings.every((f) => f.recovery));
});
