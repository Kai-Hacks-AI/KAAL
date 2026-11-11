// Case F1/T10 tests: F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'F1/T10';
export const tests = ['F1'];
export const title = 'a Case that tests two parts of one Requirement sits beside their shared parent, and any other place fails with a Recovery that names the parent';
const plan = (caseId) => ({
  intents: [{ id: 'I1' }],
  requirements: [
    { id: 'F1', kind: 'F', serves: ['I1'] },
    { id: 'F2', kind: 'F', serves: ['I1'], parent: 'F1' },
    { id: 'F3', kind: 'F', serves: ['I1'], parent: 'F1' },
  ],
  cases: [{ id: caseId, tests: ['F2', 'F3'] }, { id: 'F1/T2', tests: ['F1'] }, { id: 'I1/T9', tests: ['I1'] }],
});
test(`${id} ${title}`, async () => {
  const placed = await judge(plan('F1/T1'));
  assert.ok(!placed.findings.some((f) => f.rule === 'F1/5' && f.id === 'F1/T1'));
  const misplaced = await judge(plan('I1/T1'));
  const finding = misplaced.findings.find((f) => f.rule === 'F1/5' && f.id === 'I1/T1');
  assert.ok(finding);
  assert.match(finding.recovery, /F1/);
});
