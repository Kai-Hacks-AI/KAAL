// Case release/T24 tests: release/A10
import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluate } from '../../../../../../05-src/plan/rules.mjs';
import { index } from '../../../../../../05-src/plan/resolve.mjs';
export const id = 'release/T24';
export const tests = ['release/A10'];
export const title = 'the plan rules evaluate rules 1 to 7 of F1 over a resolved plan';
test(`${id} ${title}`, async () => {
  const plan = {
    intents: [{ id: 'release/I1' }],
    requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }, { id: 'release/F9', kind: 'F', serves: [] }],
    architecture: [{ id: 'release/A1', addresses: [] }],
    changes: [{ id: 'release/C1', implements: [], resolves: [], gaps: ['release/C1/G1'] }],
    cases: [{ id: 'release/T1', tests: ['release/F1', 'release/C1/G1'] }, { id: 'release/T2', tests: ['release/F1', 'release/F9'] }],
    evidence: [{ case: 'release/T1', result: 'passed' }],
  };
  const findings = evaluate(plan, index(plan));
  for (const n of [1, 2, 3, 4, 5, 6, 7]) assert.ok(findings.some((f) => f.rule === `F1/${n}`), `F1/${n}`);
  assert.ok(findings.every((f) => f.recovery));
});
