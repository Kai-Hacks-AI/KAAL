// Case release/T5 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T5';
export const tests = ['release/F1'];
export const title = 'a Case with no valid target, an unresolved link, a duplicate identity, or a required element with no outer-loop Case fails, and one Case covering several targets passes';
test(`${id} ${title}`, async () => {
  const result = await judge({
    intents: [{ id: 'release/I1' }],
    requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }, { id: 'release/F2', kind: 'F', serves: ['release/I1'] }, { id: 'release/F3', kind: 'F', serves: ['release/I1'] }],
    cases: [
      { id: 'release/T1', at: 'release/I1', tests: ['release/F1', 'release/F2'] },
      { id: 'release/T1', at: 'release/I1', tests: ['release/I1'] },
      { id: 'release/T2', at: 'release/I1', tests: [] },
      { id: 'release/T3', at: 'release/I1', tests: ['X99'] },
    ],
  });
  assert.equal(result.verdict, 'FAIL');
  for (const f of [{ id: 'release/T1' }, { id: 'release/T2' }, { id: 'release/T3' }, { id: 'release/F3' }]) assert.ok(result.findings.some((x) => x.rule === 'F1/4' && x.id === f.id), f.id);
  assert.ok(!result.findings.some((x) => x.rule === 'F1/4' && x.id === 'release/F2'));
});
