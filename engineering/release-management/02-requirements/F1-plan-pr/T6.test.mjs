// Case F1/T6 tests: F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'F1/T6';
export const tests = ['F1'];
export const title = 'a PLAN with no meaningful observed RED fails, and an unconditional failure alone does not count';
const base = { intents: [{ id: 'I1' }], requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }], cases: [{ id: 'F1/T1', tests: ['F1'] }] };
test(`${id} ${title}`, async () => {
  const green = await judge({ ...base, evidence: [{ case: 'F1/T1', result: 'passed' }] });
  const unconditional = await judge({ ...base, evidence: [{ case: 'F1/T1', result: 'failed', reason: 'unconditional' }] });
  const observed = await judge({ ...base, evidence: [{ case: 'F1/T1', result: 'failed', reason: 'assertion', target: 'F1' }] });
  assert.ok(green.findings.some((f) => f.rule === 'F1/6'));
  assert.ok(unconditional.findings.some((f) => f.rule === 'F1/6'));
  assert.ok(!observed.findings.some((f) => f.rule === 'F1/6'));
});
