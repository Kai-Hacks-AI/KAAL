// Case change/T1054 tests: change/I26
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, green, evidence, evaluation, CAPABILITY_PLAN, CHANGE_PLAN, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1054';
export const tests = ['change/I26'];
export const title = "a Change lifecycle ends with the verification of enduring objects intact: the correct ACT passes both controls, an enduring object's Case may be renamed and moved without a finding, and a Case in the folder that tests an enduring object, or an element left unverified, is a finding";
export async function run() {
  const c = await load();
  const good = acted();
  assert.deepEqual(c.judgeFolders(view(good)), [], 'the correct ACT is judged defective');
  assert.deepEqual(c.judgeRetirement({ before: view(done()), head: view(good), from: view(from()), evidence: green() }), [], 'the correct retirement is judged defective');
  // refactorable: the element's Case is renamed and moved; only the execution evidence matters
  const moved = acted(); delete moved[`${P}/02-requirements/F2-new/T12.test.mjs`];
  moved[`${P}/02-requirements/F2-new/checks/T99.test.mjs`] = kase('p/T99', 'p/F2');
  const movedEvidence = evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed', 'p/T99': 'passed' }), evaluation(CHANGE_PLAN, { 'p/T10': 'passed', 'p/T11': 'passed' }));
  assert.deepEqual(c.judgeRetirement({ before: view(done()), head: view(moved), from: view(from()), evidence: movedEvidence }), [], 'a renamed and moved Case was judged lost');
  // defective: the verification of F2 lives only in the folder
  const defective = { ...done(), [`${FOLDER}/T10.test.mjs`]: kase('p/T10', 'p/F2') };
  delete defective[`${P}/02-requirements/F2-new/T12.test.mjs`];
  assert.ok(c.judgeFolders(view(defective)).some((f) => f.rule === 'target-case-in-change-folder' && f.path === `${FOLDER}/T10.test.mjs`), 'a Case in the folder that tests an enduring object was not found');
  assert.ok(c.judgeRetirement({ before: view(defective), head: view(acted(defective)), from: view(from()), evidence: green() }).some((f) => f.rule === 'touched-element-unverified'), 'an unverified element was retired');
}
test(id, () => run());
