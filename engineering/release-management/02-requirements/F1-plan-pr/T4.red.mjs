// Case F1/T4 tests: F1
import assert from 'node:assert/strict';
export const id = 'F1/T4';
export const tests = ['F1'];
export const title = 'a Case with no valid target, an unresolved link, a duplicate identity, or a required element with no outer-loop Case fails, and one Case covering several targets passes';
export async function run() {
  const { judge } = await import('../../05-src/plan/judge.mjs');
  const result = await judge({
    intents: [{ id: 'I1' }],
    requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }, { id: 'F2', kind: 'F', serves: ['I1'] }, { id: 'F3', kind: 'F', serves: ['I1'] }],
    cases: [
      { id: 'I1/T1', at: 'I1', tests: ['F1', 'F2'] },
      { id: 'I1/T1', at: 'I1', tests: ['I1'] },
      { id: 'I1/T2', at: 'I1', tests: [] },
      { id: 'I1/T3', at: 'I1', tests: ['X99'] },
    ],
  });
  assert.equal(result.verdict, 'FAIL');
  for (const f of [{ id: 'I1/T1' }, { id: 'I1/T2' }, { id: 'I1/T3' }, { id: 'F3' }]) assert.ok(result.findings.some((x) => x.rule === 'F1/4' && x.id === f.id), f.id);
  assert.ok(!result.findings.some((x) => x.rule === 'F1/4' && x.id === 'F2'));
}
