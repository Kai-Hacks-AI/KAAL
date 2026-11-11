// Case A10/T1 tests: A10
import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluate } from '../../../../../../05-src/plan/rules.mjs';
import { index } from '../../../../../../05-src/plan/resolve.mjs';
export const id = 'A10/T1';
export const tests = ['A10'];
export const title = 'the plan rules evaluate rules 1 to 7 of F1 over a resolved plan';
test(`${id} ${title}`, async () => {
  const plan = {
    intents: [{ id: 'I1' }],
    requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }, { id: 'F9', kind: 'F', serves: [] }],
    architecture: [{ id: 'A1', addresses: [] }],
    changes: [{ id: 'C1', implements: [], resolves: [], gaps: ['C1/G1'] }],
    cases: [{ id: 'X/T1', tests: ['F1', 'C1/G1'] }, { id: 'X/T2', tests: ['F1', 'F9'] }],
    evidence: [{ case: 'X/T1', result: 'passed' }],
  };
  const findings = evaluate(plan, index(plan));
  for (const n of [1, 2, 3, 4, 5, 6, 7]) assert.ok(findings.some((f) => f.rule === `F1/${n}`), `F1/${n}`);
  assert.ok(findings.every((f) => f.recovery));
});
