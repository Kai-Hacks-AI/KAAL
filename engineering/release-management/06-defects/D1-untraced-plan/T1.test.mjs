// Case D1/T1 tests: D1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'D1/T1';
export const tests = ['D1'];
export const title = 'an untraced PLAN is caught';
const untraced = {
  changes: [{ id: 'C9', implements: [], resolves: [] }],
  requirements: [{ id: 'F9', kind: 'F', serves: [] }],
  architecture: [{ id: 'A9', addresses: [] }],
  cases: [],
  evidence: [{ case: 'F9/T1', result: 'failed', reason: 'assertion', target: 'F9' }],
};
test(`${id} ${title}`, async () => {
  const result = await judge(untraced);
  assert.equal(result.verdict, 'FAIL');
  for (const rule of ['F1/1', 'F1/2', 'F1/3']) assert.ok(result.findings.some((f) => f.rule === rule), rule);
});
