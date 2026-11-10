// Case F1/T8 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T8';
export const tests = ['F1'];
export const title = 'unreadable input and missing evidence yield UNKNOWN, UNKNOWN never passes, and every failure carries a Recovery';
export async function run() {
  const { judge } = await import('../../05-src/plan/judge.mjs');
  const unreadable = await judge({ unreadable: 'plan.md' });
  assert.equal(unreadable.verdict, 'UNKNOWN');
  assert.notEqual(unreadable.verdict, 'PASS');
  assert.ok(unreadable.findings.length > 0 && unreadable.findings.every((f) => f.recovery));
}
