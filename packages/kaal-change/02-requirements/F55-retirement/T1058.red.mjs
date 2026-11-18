// Case change/T1058 tests: change/F55
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, green, evidence, evaluation, CAPABILITY_PLAN, CHANGE_PLAN, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1058';
export const tests = ['change/F55'];
export const title = 'a deleted Change registration is a finding when the folder holds no act.md, when a record of the Change is removed, when there is no counted evidence, when a touched element has no passing Case in a surviving check, when evidence is mixed (one Case that claims the element passes and another fails, in the same or in two evaluations), and when a retiring check is not evaluated or fails; removing an executable Case is not a finding';
export async function run() {
  const c = await load();
  const run = (head, { before = done(), evidence = green() } = {}) => c.judgeRetirement({ before: view(before), head: view(head), from: view(from()), evidence });
  const rules = (found) => found.map((f) => f.rule).sort();
  const { [`${FOLDER}/kaal-guard.json`]: _gone, ...noAct } = done();
  assert.deepEqual(rules(run(noAct)), ['not-closed']);
  // history is the records; the executable Cases and helpers are free to go
  const withRecords = { ...done(), [`${FOLDER}/evidence.md`]: 'x' };
  const { [`${FOLDER}/evidence.md`]: _e, ...lostRecord } = acted(withRecords);
  assert.deepEqual(run(lostRecord, { before: withRecords }).map((f) => [f.rule, f.path]), [['history-removed', `${FOLDER}/evidence.md`]]);
  const { [`${FOLDER}/T11.test.mjs`]: _t, ...fewerCases } = acted();
  assert.deepEqual(run(fewerCases), [], 'removing an executable Case was a finding');
  assert.deepEqual(rules(run(acted(), { evidence: null })), ['no-evidence']);
  assert.deepEqual(rules(run(acted(), { evidence: { by: 'ci', evaluations: [{ ...green().evaluations[0], findings: ['x'] }, green().evaluations[1]] } })), ['touched-element-unverified'], 'an evaluation with findings counted');
  // mixed PASS/FAIL: a second Case claims F2 and passes while T12 fails; one pass does not cover the failure
  const two = { ...acted(), [`${P}/02-requirements/F2-new/T13.test.mjs`]: kase('p/T13', 'p/F2') };
  const mixed = evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed', 'p/T12': 'failed', 'p/T13': 'passed' }), evaluation(CHANGE_PLAN, { 'p/T10': 'passed', 'p/T11': 'passed' }));
  const found = run(two, { evidence: mixed });
  assert.deepEqual(found.map((f) => [f.rule, f.path]), [['touched-element-failing', `${P}/02-requirements/F2-new`]], 'mixed PASS/FAIL evidence reported continuity');
  assert.ok(found[0].detail.includes('p/T12'), 'the failing Case is not named');
  const splitAcross = evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed', 'p/T12': 'passed', 'p/T13': 'passed' }), evaluation(`${P}/kaal-guard.json:more`, { 'p/T13': 'failed' }), evaluation(CHANGE_PLAN, { 'p/T10': 'passed', 'p/T11': 'passed' }));
  const secondCheck = { ...two, [`${P}/kaal-guard.json`]: JSON.stringify({ checks: [{ id: 'enduring-cases', run: 'x' }, { id: 'more', run: 'y' }] }) };
  assert.deepEqual(rules(run(secondCheck, { evidence: splitAcross })), ['touched-element-failing'], 'a failure in a second surviving check was covered by a pass in the first');
  assert.deepEqual(rules(run(acted(), { evidence: evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed', 'p/T12': 'failed' }), evaluation(CHANGE_PLAN, { 'p/T10': 'passed' })) })), ['touched-element-failing', 'touched-element-unverified']);
  assert.deepEqual(rules(run(acted(), { evidence: evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed', 'p/T12': 'passed' })) })), ['retiring-check-not-evaluated']);
  const failing = evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed', 'p/T12': 'passed' }), evaluation(CHANGE_PLAN, { 'p/T10': 'passed', 'p/T11': 'failed' }));
  assert.deepEqual(run(acted(), { evidence: failing }).map((f) => [f.rule, f.path]), [['retiring-check-failing', CHANGE_PLAN]]);
  // a Case that claims the element but sits only in the retiring check does not verify it
  const onlyRetiring = evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed' }), evaluation(CHANGE_PLAN, { 'p/T10': 'passed', 'p/T11': 'passed', 'p/T12': 'passed' }));
  assert.ok(rules(run(acted(), { evidence: onlyRetiring })).includes('touched-element-unverified'), 'verification by the retiring check counted');
}
test(id, () => run());
