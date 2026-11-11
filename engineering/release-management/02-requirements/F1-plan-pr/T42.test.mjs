// Case release/T42 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T42';
export const tests = ['release/F1'];
export const title = 'a Gap is closed by exactly one Change, every Change closes a Gap, and a parent Gap is closed through its child Gaps';
const plan = (over = {}) => ({
  intents: [{ id: 'release/I1' }],
  gaps: [{ id: 'release/G1' }],
  changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G1'] }],
  cases: [{ id: 'release/T1', at: 'release/C1', tests: ['release/G1'] }, { id: 'release/T2', at: 'release/I1', tests: ['release/I1'] }],
  evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/G1' }],
  ...over,
});
const has = (result, rule, id) => result.findings.some((f) => f.rule === rule && f.id === id);
test(`${id} ${title}`, async () => {
  assert.equal((await judge(plan())).verdict, 'PASS');

  const noGap = await judge(plan({ changes: [{ id: 'release/C1', implements: ['release/I1'] }] }));
  assert.ok(has(noGap, 'F1/1', 'release/C1'));
  assert.ok(noGap.findings.some((f) => f.rule === 'F1/1' && f.id === 'release/G1'));

  const two = await judge(plan({ changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G1'] }, { id: 'release/C2', implements: ['release/I1'], closes: ['release/G1'] }] }));
  assert.ok(has(two, 'F1/1', 'release/G1'));

  const wrongKind = await judge(plan({ changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/I1'] }] }));
  assert.ok(has(wrongKind, 'F1/4', 'release/C1'));

  const badId = await judge(plan({ gaps: [{ id: 'release/C1/G1' }], changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/C1/G1'] }] }));
  assert.ok(has(badId, 'F1/4', 'release/C1/G1'));

  const parent = {
    gaps: [{ id: 'release/G1' }, { id: 'release/G2', parent: 'release/G1' }, { id: 'release/G3', parent: 'release/G1' }],
    changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G2'] }, { id: 'release/C2', implements: ['release/I1'], closes: ['release/G3'] }],
    cases: [{ id: 'release/T1', at: 'release/C1', tests: ['release/G2'] }, { id: 'release/T2', at: 'release/C2', tests: ['release/G3'] }, { id: 'release/T3', at: 'release/I1', tests: ['release/I1'] }, { id: 'release/T4', at: 'release/I1', tests: ['release/G1'] }],
    evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/G2' }],
  };
  const derived = await judge(plan(parent));
  assert.ok(!derived.findings.some((f) => f.rule === 'F1/1'));
  assert.deepEqual(derived.findings.filter((f) => ['F1/5', 'F1/7'].includes(f.rule)), []);

  const direct = await judge(plan({ ...parent, changes: [...parent.changes, { id: 'release/C3', implements: ['release/I1'], closes: ['release/G1'] }] }));
  assert.ok(has(direct, 'F1/1', 'release/G1'));

  const cycle = await judge(plan({ gaps: [{ id: 'release/G1', parent: 'release/G1' }], cases: [{ id: 'release/T1', at: 'release', tests: ['release/G1'] }, { id: 'release/T2', at: 'release/I1', tests: ['release/I1'] }] }));
  assert.ok(has(cycle, 'F1/3', 'release/G1'));
});
