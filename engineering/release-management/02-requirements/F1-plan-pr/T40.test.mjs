// Case release/T40 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T40';
export const tests = ['release/F1'];
export const title = 'a plan model with a malformed collection or entry yields UNKNOWN with a Recovery that names it, and never throws';
test(`${id} ${title}`, async () => {
  const malformed = [
    [{ intents: {} }, 'intents'],
    [{ changes: [null] }, 'changes'],
    [{ evidence: [null] }, 'evidence'],
    [{ cases: 'none' }, 'cases'],
    [{ changes: [{ id: 'release/C1', gaps: 'G1' }] }, 'changes.gaps'],
  ];
  for (const [plan, name] of malformed) {
    const result = await judge(plan);
    assert.equal(result.verdict, 'UNKNOWN', name);
    const finding = result.findings.find((f) => f.rule === 'F1/8' && f.id === name);
    assert.ok(finding, name);
    assert.match(finding.recovery, new RegExp(`Make ${name.replace('.', '\\.')} a list of objects`));
  }
});
