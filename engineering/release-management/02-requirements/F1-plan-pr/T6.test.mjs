// Case release/T6 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T6';
export const tests = ['release/F1'];
export const title = 'a Case placed away from the nearest shared ancestor of its targets fails with a Recovery that names the place';
test(`${id} ${title}`, async () => {
  const result = await judge({
    intents: [{ id: 'release/I1' }],
    requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }, { id: 'release/F2', kind: 'F', serves: ['release/I1'] }],
    architecture: [{ id: 'release/A3', addresses: ['release/F1'] }],
    cases: [{ id: 'release/T1', found: 'release/A3', tests: ['release/F1', 'release/F2'] }],
  });
  assert.equal(result.verdict, 'FAIL');
  const finding = result.findings.find((f) => f.rule === 'F1/5' && f.id === 'release/T1');
  assert.ok(finding);
  assert.match(finding.recovery, /release\/I1/);
});
