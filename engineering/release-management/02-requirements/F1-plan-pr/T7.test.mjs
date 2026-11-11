// Case release/T7 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T7';
export const tests = ['release/F1'];
export const title = 'a PLAN with no meaningful observed RED fails, and an unconditional failure alone does not count';
const base = { intents: [{ id: 'release/I1' }], requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }], cases: [{ id: 'release/T1', tests: ['release/F1'] }] };
test(`${id} ${title}`, async () => {
  const green = await judge({ ...base, evidence: [{ case: 'release/T1', result: 'passed' }] });
  const unconditional = await judge({ ...base, evidence: [{ case: 'release/T1', result: 'failed', reason: 'unconditional' }] });
  const observed = await judge({ ...base, evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/F1' }] });
  assert.ok(green.findings.some((f) => f.rule === 'F1/6'));
  assert.ok(unconditional.findings.some((f) => f.rule === 'F1/6'));
  assert.ok(!observed.findings.some((f) => f.rule === 'F1/6'));
});
