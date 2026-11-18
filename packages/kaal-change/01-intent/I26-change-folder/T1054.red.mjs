// Case change/T1054 tests: change/I26
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, P, FOLDER } from '../../test/folder-control-support.mjs';
export const id = 'change/T1054';
export const tests = ['change/I26'];
export const title = "a Change lifecycle ends with nothing enduring lost: the correct ACT passes both controls, a Case in the folder that tests an element fails the folder control, and a registration deleted without the element's target Case fails retirement";
export async function run() {
  const c = await load();
  const good = acted();
  assert.deepEqual(c.judgeFolders(view(good)), [], 'the correct ACT is judged defective');
  assert.deepEqual(c.judgeRetirement({ before: view(done()), head: view(good), from: view(from()) }), [], 'the correct retirement is judged defective');
  const defective = { ...done(), [`${FOLDER}/T10.test.mjs`]: kase('p/T10', 'p/F2'), [`${P}/02-requirements/F2-new/T12.test.mjs`]: undefined };
  delete defective[`${P}/02-requirements/F2-new/T12.test.mjs`];
  assert.ok(c.judgeFolders(view(defective)).some((f) => f.rule === 'target-case-in-change-folder' && f.path === `${FOLDER}/T10.test.mjs`), 'a Case in the folder that tests an element was not found');
  assert.ok(c.judgeRetirement({ before: view(defective), head: view(acted(defective)), from: view(from()) }).some((f) => f.rule === 'touched-element-without-target-case'), 'an element without a target Case was retired');
}
test(id, () => run());
