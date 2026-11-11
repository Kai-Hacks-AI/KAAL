// Case release/T11 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T11';
export const tests = ['release/F1'];
export const title = 'a Case that tests two parts of one Requirement sits beside their shared parent, and any other place fails with a Recovery that names the parent';
const plan = (at) => ({
  intents: [{ id: 'release/I1' }],
  requirements: [
    { id: 'release/F1', kind: 'F', serves: ['release/I1'] },
    { id: 'release/F2', kind: 'F', serves: ['release/I1'], parent: 'release/F1' },
    { id: 'release/F3', kind: 'F', serves: ['release/I1'], parent: 'release/F1' },
  ],
  cases: [{ id: 'release/T1', at, tests: ['release/F2', 'release/F3'] }, { id: 'release/T2', at: 'release/F1', tests: ['release/F1'] }, { id: 'release/T3', at: 'release/I1', tests: ['release/I1'] }],
});
test(`${id} ${title}`, async () => {
  const placed = await judge(plan('release/F1'));
  assert.ok(!placed.findings.some((f) => f.rule === 'F1/5' && f.id === 'release/T1'));
  const misplaced = await judge(plan('release/I1'));
  const finding = misplaced.findings.find((f) => f.rule === 'F1/5' && f.id === 'release/T1');
  assert.ok(finding);
  assert.match(finding.recovery, /release\/F1/);
});
