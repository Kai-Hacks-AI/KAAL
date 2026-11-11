// Case release/T38 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T38';
export const tests = ['release/F1'];
export const title = 'a Case whose targets share no ancestor sits at the capability, and any other place fails with a Recovery that names the capability';
const plan = (at) => ({
  intents: [{ id: 'release/I1' }, { id: 'release/I2' }],
  cases: [
    { id: 'release/T1', at, tests: ['release/I1', 'release/I2'] },
  ],
  evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/I1' }],
});
test(`${id} ${title}`, async () => {
  const placed = await judge(plan('release'));
  assert.ok(!placed.findings.some((f) => f.rule === 'F1/5' || f.rule === 'F1/7'));
  const misplaced = await judge(plan('release/I1'));
  const finding = misplaced.findings.find((f) => f.rule === 'F1/5' && f.id === 'release/T1');
  assert.ok(finding);
  assert.equal(finding.status, 'fail');
  assert.match(finding.recovery, /beside release\./);
});
