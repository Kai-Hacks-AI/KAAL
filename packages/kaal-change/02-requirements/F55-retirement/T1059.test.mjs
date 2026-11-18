// Case change/T1059 tests: change/F55
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, green, evidence, evaluation, CAPABILITY_PLAN, CHANGE_PLAN, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1059';
export const tests = ['change/F55'];
export const title = "closing passes a complete ACT on counted execution evidence, lets an element's Cases be moved, split, consolidated or replaced as long as a check outside the Change folder passes every Case that claims it, and is not applied when no act.md is added";
export async function run() {
  const c = await load();
  const ok = (head, ev = green()) => c.judgeClosing({ base: view(done()), head: view(head), from: view(from()), evidence: ev });
  assert.deepEqual(ok(acted()), [], 'a complete ACT fails');
  const split = acted(); delete split[`${P}/02-requirements/F2-new/T12.test.mjs`];
  split[`${P}/02-requirements/F2-new/T20.test.mjs`] = kase('p/T20', 'p/F2'); split[`${P}/02-requirements/F2-new/T21.test.mjs`] = kase('p/T21', 'p/F2');
  assert.deepEqual(ok(split, evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed', 'p/T20': 'passed', 'p/T21': 'passed' }), evaluation(CHANGE_PLAN, { 'p/T10': 'passed' }))), [], 'a split whose Cases all pass was judged lost');
  const rewritten = acted(); rewritten[`${P}/02-requirements/F2-new/T12.test.mjs`] = kase('p/T77', 'p/F2');
  assert.deepEqual(ok(rewritten, evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed', 'p/T77': 'passed' }), evaluation(CHANGE_PLAN, { 'p/T10': 'passed' }))), [], 'a rewritten Case with a new identity was judged lost');
  assert.ok(ok(acted(), evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed' }), evaluation(CHANGE_PLAN, { 'p/T10': 'passed' }))).some((f) => f.rule === 'touched-element-unverified'), 'a Case that claims F2 but was not evaluated counted');
  // an ordinary diff, and a diff on a folder that is already closed, are not judged
  const edited = { ...done(), [`${P}/02-requirements/F1-old/F1.md`]: '# p/F1 changed\n' };
  assert.deepEqual(c.judgeClosing({ base: view(done()), head: view(edited), from: view(from()), evidence: undefined }), [], 'a diff that adds no act.md was judged');
  assert.deepEqual(c.judgeClosing({ base: view(acted()), head: view(acted()), from: view(from()), evidence: undefined }), [], 'a folder that was already closed was judged');
}
test(id, () => run());
