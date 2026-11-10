// Case A11/T1 tests: A11
import assert from 'node:assert/strict';
import test from 'node:test';
import { report } from '../../../../../../05-src/plan/report.mjs';
export const id = 'A11/T1';
export const tests = ['A11'];
export const title = 'the reporter emits PASS, FAIL or UNKNOWN with findings, and a Recovery for every failure';
test(`${id} ${title}`, async () => {
  assert.equal(report([]).verdict, 'PASS');
  assert.equal(report([{ rule: 'F1/6', id: 'evidence', status: 'unknown' }]).verdict, 'UNKNOWN');
  const mixed = report([{ rule: 'F1/6', id: 'evidence', status: 'unknown' }, { rule: 'F1/1', id: 'C9', status: 'fail' }]);
  assert.equal(mixed.verdict, 'FAIL');
  assert.ok(mixed.findings.every((f) => f.recovery));
});
