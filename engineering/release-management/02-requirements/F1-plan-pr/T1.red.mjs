// Case F1/T1 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T1';
export const tests = ['F1'];
export const title = 'a Change with neither an implemented Intent nor a resolved Defect fails';
export async function run({ judge }) {
  const result = await judge({ intents: [{ id: 'I1' }], defects: [], changes: [{ id: 'C9', implements: [], resolves: [] }] });
  assert.equal(result.verdict, 'FAIL');
  assert.ok(result.findings.some((f) => f.rule === 'F1/1' && f.id === 'C9'));
  assert.ok(result.findings.every((f) => f.recovery));
}
