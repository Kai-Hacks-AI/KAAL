// Case release/T4 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T4';
export const tests = ['release/F1'];
export const title = 'an Architecture element that addresses nothing, or a parent link with a missing, wrong-kind or cyclic target, fails, and parent confers no coverage';
test(`${id} ${title}`, async () => {
  const result = await judge({
    requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }],
    architecture: [
      { id: 'release/A1', addresses: ['release/F1'] },
      { id: 'release/A9', parent: 'release/A1', addresses: [] },
      { id: 'release/A10', parent: 'release/A11', addresses: ['release/F1'] },
      { id: 'release/A11', parent: 'release/A10', addresses: ['release/F1'] },
      { id: 'release/A12', parent: 'release/F1', addresses: ['release/F1'] },
      { id: 'release/A13', parent: 'release/A99', addresses: ['release/F1'] },
    ],
  });
  assert.equal(result.verdict, 'FAIL');
  for (const aid of ['release/A9', 'release/A10', 'release/A12', 'release/A13']) assert.ok(result.findings.some((f) => f.rule === 'F1/3' && f.id === aid), aid);
  assert.ok(!result.findings.some((f) => f.rule === 'F1/3' && f.id === 'release/A1'));
});
