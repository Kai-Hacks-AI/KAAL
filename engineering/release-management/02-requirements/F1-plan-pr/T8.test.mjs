// Case release/T8 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T8';
export const tests = ['release/F1'];
export const title = 'a target-oriented Case that tests a Change gap fails, a Change-oriented Case that covers several gaps passes';
test(`${id} ${title}`, async () => {
  const result = await judge({
    intents: [{ id: 'release/I1' }],
    requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }],
    changes: [{ id: 'release/C1', implements: ['release/I1'], gaps: ['release/C1/G1', 'release/C1/G2', 'release/C1/G3'] }],
    cases: [
      { id: 'release/T1', at: 'release/C1', tests: ['release/C1/G1', 'release/C1/G2'] },
      { id: 'release/T2', at: 'release/F1', tests: ['release/F1', 'release/C1/G3'] },
    ],
  });
  assert.ok(result.findings.some((f) => f.rule === 'F1/7' && f.id === 'release/T2'));
  assert.ok(!result.findings.some((f) => f.rule === 'F1/7' && f.id === 'release/T1'));
});
