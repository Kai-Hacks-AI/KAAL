// Case F1/T3 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T3';
export const tests = ['F1'];
export const title = 'an Architecture element that addresses nothing, or a parent link with a missing, wrong-kind or cyclic target, fails, and parent confers no coverage';
export async function run() {
  const { judge } = await import('../../05-src/plan/judge.mjs');
  const result = await judge({
    requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }],
    architecture: [
      { id: 'A1', addresses: ['F1'] },
      { id: 'A9', parent: 'A1', addresses: [] },
      { id: 'A10', parent: 'A11', addresses: ['F1'] },
      { id: 'A11', parent: 'A10', addresses: ['F1'] },
      { id: 'A12', parent: 'F1', addresses: ['F1'] },
      { id: 'A13', parent: 'A99', addresses: ['F1'] },
    ],
  });
  assert.equal(result.verdict, 'FAIL');
  for (const aid of ['A9', 'A10', 'A12', 'A13']) assert.ok(result.findings.some((f) => f.rule === 'F1/3' && f.id === aid), aid);
  assert.ok(!result.findings.some((f) => f.id === 'A1'));
}
