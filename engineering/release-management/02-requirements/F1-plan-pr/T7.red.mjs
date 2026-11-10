// Case F1/T7 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T7';
export const tests = ['F1'];
export const title = 'a target-oriented Case that tests a Change gap fails, a Change-oriented Case that covers several gaps passes';
export async function run({ judge }) {
  const result = await judge({
    intents: [{ id: 'I1' }],
    requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }],
    changes: [{ id: 'C1', implements: ['I1'], gaps: ['C1/G1', 'C1/G2', 'C1/G3'] }],
    cases: [
      { id: 'C1/T1', at: 'C1', tests: ['C1/G1', 'C1/G2'] },
      { id: 'F1/T9', at: 'F1', tests: ['F1', 'C1/G3'] },
    ],
  });
  assert.ok(result.findings.some((f) => f.rule === 'F1/7' && f.id === 'F1/T9'));
  assert.ok(!result.findings.some((f) => f.rule === 'F1/7' && f.id === 'C1/T1'));
}
