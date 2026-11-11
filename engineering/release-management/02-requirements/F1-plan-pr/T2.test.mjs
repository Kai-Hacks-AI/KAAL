// Case release/T2 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T2';
export const tests = ['release/F1'];
export const title = 'a Change with neither an implemented Intent nor a resolved Defect fails';
test(`${id} ${title}`, async () => {
  const result = await judge({ intents: [{ id: 'release/I1' }], defects: [], changes: [{ id: 'release/C9', implements: [], resolves: [] }] });
  assert.equal(result.verdict, 'FAIL');
  assert.ok(result.findings.some((f) => f.rule === 'F1/1' && f.id === 'release/C9'));
  assert.ok(result.findings.every((f) => f.recovery));
});
