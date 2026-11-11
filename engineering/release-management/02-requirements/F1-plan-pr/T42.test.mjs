// Case release/T42 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T42';
export const tests = ['release/F1'];
export const title = 'a Case that tests Gaps sits where its targets sit, and a Change may close several Gaps, every Gap, parents included, has exactly one closing Change, and any parent is done only when its children are done';
const plan = (over = {}) => ({
  intents: [{ id: 'release/I1' }],
  gaps: [{ id: 'release/G1' }],
  changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G1'] }],
  cases: [{ id: 'release/T1', found: 'release/C1', tests: ['release/G1'] }, { id: 'release/T2', found: 'release/I1', tests: ['release/I1'] }],
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

  const family = [{ id: 'release/G1' }, { id: 'release/G2', parent: 'release/G1' }, { id: 'release/G3', parent: 'release/G1' }];
  const evidence = [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/G2' }];
  const intent = { id: 'release/T9', found: 'release/I1', tests: ['release/I1'] };

  // One Change may close a parent Gap and its children together.
  const together = await judge(plan({ gaps: family, changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G1', 'release/G2', 'release/G3'] }], cases: [{ id: 'release/T1', found: 'release/C1', tests: ['release/G1', 'release/G2', 'release/G3'] }, intent], evidence }));
  assert.equal(together.verdict, 'PASS');

  // The parent Gap has its own closing Change and its own place, even when the children belong to unrelated Intents.
  const apart = await judge(plan({
    intents: [{ id: 'release/I1' }, { id: 'release/I2' }],
    gaps: family,
    changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G2'] }, { id: 'release/C2', implements: ['release/I2'], closes: ['release/G3'] }, { id: 'release/C3', implements: ['release/I1'], closes: ['release/G1'] }],
    cases: [{ id: 'release/T1', found: 'release/C1', tests: ['release/G2'] }, { id: 'release/T2', found: 'release/C2', tests: ['release/G3'] }, { id: 'release/T3', found: 'release/C3', tests: ['release/G1'] }, intent, { id: 'release/T4', found: 'release/I2', tests: ['release/I2'] }],
    evidence,
  }));
  assert.equal(apart.verdict, 'PASS');

  // A parent Gap is a Gap: it has exactly one closing Change.
  const open = await judge(plan({ gaps: family, changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G2', 'release/G3'] }], cases: [{ id: 'release/T1', found: 'release/C1', tests: ['release/G2', 'release/G3'] }, { id: 'release/T3', found: 'release/I1', tests: ['release/G1'] }, intent], evidence }));
  assert.ok(has(open, 'F1/1', 'release/G1'));

  // A parent Gap is done only when its children are done: a passing Case on the parent needs passing Cases on every child.
  const together3 = { gaps: family, changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G1', 'release/G2', 'release/G3'] }], cases: [{ id: 'release/T1', found: 'release/C1', tests: ['release/G1'] }, { id: 'release/T2', found: 'release/C1', tests: ['release/G2'] }, { id: 'release/T3', found: 'release/C1', tests: ['release/G3'] }, intent] };
  const red = { case: 'release/T3', result: 'failed', reason: 'assertion', target: 'release/G3' };
  const green = (caseId, target) => ({ case: caseId, result: 'passed', target });
  const early = await judge(plan({ ...together3, evidence: [green('release/T1', 'release/G1'), green('release/T2', 'release/G2'), red] }));
  assert.ok(has(early, 'F1/3', 'release/G1'));
  assert.ok(early.findings.some((f) => f.id === 'release/G1' && /child/i.test(f.message) && /release\/G3/.test(f.message)));
  const done = await judge(plan({ ...together3, evidence: [green('release/T1', 'release/G1'), green('release/T2', 'release/G2'), green('release/T3', 'release/G3'), { case: 'release/T9', result: 'failed', reason: 'assertion', target: 'release/I1' }] }));
  assert.ok(!done.findings.some((f) => f.rule === 'F1/3'));
  const underway = await judge(plan({ ...together3, evidence: [green('release/T2', 'release/G2'), red] }));
  assert.ok(!underway.findings.some((f) => f.rule === 'F1/3'));

  // Every tested kind behaves the same way: a Requirement parent is done only when its child Requirements are done.
  const reqs = (evidence) => ({
    gaps: [{ id: 'release/G1' }],
    changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G1'] }],
    requirements: [{ id: 'release/F1', serves: ['release/I1'] }, { id: 'release/F2', serves: ['release/I1'], parent: 'release/F1' }],
    cases: [{ id: 'release/T1', found: 'release/C1', tests: ['release/G1'] }, { id: 'release/T2', found: 'release/F1', tests: ['release/F1'] }, { id: 'release/T3', found: 'release/F2', tests: ['release/F2'] }, intent],
    evidence,
  });
  const reqRed = { case: 'release/T3', result: 'failed', reason: 'assertion', target: 'release/F2' };
  const reqEarly = await judge(plan(reqs([green('release/T2', 'release/F1'), reqRed])));
  assert.ok(has(reqEarly, 'F1/3', 'release/F1'));
  const reqDone = await judge(plan(reqs([green('release/T2', 'release/F1'), green('release/T3', 'release/F2'), { case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/G1' }])));
  assert.ok(!reqDone.findings.some((f) => f.rule === 'F1/3'));

  const multi = await judge(plan({
    gaps: [{ id: 'release/G1' }, { id: 'release/G2' }],
    changes: [{ id: 'release/C1', implements: ['release/I1'], closes: ['release/G1'] }, { id: 'release/C2', implements: ['release/I1'], closes: ['release/G2'] }],
    cases: [{ id: 'release/T1', found: 'release/I1', tests: ['release/G1', 'release/G2'] }, { id: 'release/T2', found: 'release/I1', tests: ['release/I1'] }],
    evidence: [{ case: 'release/T1', result: 'failed', reason: 'assertion', target: 'release/G1' }],
  }));
  assert.equal(multi.verdict, 'PASS');

  const cycle = await judge(plan({ gaps: [{ id: 'release/G1', parent: 'release/G1' }], cases: [{ id: 'release/T1', found: 'release', tests: ['release/G1'] }, { id: 'release/T2', found: 'release/I1', tests: ['release/I1'] }] }));
  assert.ok(has(cycle, 'F1/3', 'release/G1'));
});
