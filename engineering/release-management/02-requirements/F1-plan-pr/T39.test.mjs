// Case release/T39 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T39';
export const tests = ['release/F1'];
export const title = 'the lowest shared ancestor wins over a shorter semantic path, so a Case testing a Requirement and its grandchild sits beside the Requirement';
const plan = (at) => ({
  intents: [{ id: 'release/I1' }],
  requirements: [
    { id: 'release/F1', kind: 'F', serves: ['release/I1'] },
    { id: 'release/F2', kind: 'F', serves: ['release/I1'], parent: 'release/F1' },
    { id: 'release/F3', kind: 'F', serves: ['release/I1'], parent: 'release/F2' },
  ],
  cases: [
    { id: 'release/T1', at, tests: ['release/F1', 'release/F3'] },
    { id: 'release/T2', at: 'release/F2', tests: ['release/F2'] },
    { id: 'release/T3', at: 'release/I1', tests: ['release/I1'] },
  ],
  evidence: [{ case: 'release/T2', result: 'failed', reason: 'assertion', target: 'release/F2' }],
});
test(`${id} ${title}`, async () => {
  const placed = await judge(plan('release/F1'));
  assert.ok(!placed.findings.some((f) => f.rule === 'F1/5' && f.id === 'release/T1'));
  const misplaced = await judge(plan('release/I1'));
  const finding = misplaced.findings.find((f) => f.rule === 'F1/5' && f.id === 'release/T1');
  assert.ok(finding);
  assert.match(finding.recovery, /beside release\/F1/);
});
