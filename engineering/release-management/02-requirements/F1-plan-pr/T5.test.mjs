// Case F1/T5 tests: F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'F1/T5';
export const tests = ['F1'];
export const title = 'a Case placed away from the nearest shared ancestor of its targets fails with a Recovery that names the place';
test(`${id} ${title}`, async () => {
  const result = await judge({
    intents: [{ id: 'I1' }],
    requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }, { id: 'F2', kind: 'F', serves: ['I1'] }],
    architecture: [{ id: 'A3', addresses: ['F1'] }],
    cases: [{ id: 'A3/T1', tests: ['F1', 'F2'] }],
  });
  assert.equal(result.verdict, 'FAIL');
  const finding = result.findings.find((f) => f.rule === 'F1/5' && f.id === 'A3/T1');
  assert.ok(finding);
  assert.match(finding.recovery, /I1/);
});
