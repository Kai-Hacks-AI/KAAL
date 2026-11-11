// Case release/T28 tests: release/D1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T28';
export const tests = ['release/D1'];
export const title = 'an untraced PLAN is caught';
const untraced = {
  changes: [{ id: 'release/C9', implements: [], resolves: [] }],
  requirements: [{ id: 'release/F9', kind: 'F', serves: [] }],
  architecture: [{ id: 'release/A9', addresses: [] }],
  cases: [],
  evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/F9' }],
};
test(`${id} ${title}`, async () => {
  const result = await judge(untraced);
  assert.equal(result.verdict, 'FAIL');
  for (const rule of ['F1/1', 'F1/2', 'F1/3']) assert.ok(result.findings.some((f) => f.rule === rule), rule);
});
