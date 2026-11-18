// Case change/T1128 tests: change/F56
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, green, evidence, evaluation, CAPABILITY_PLAN, CHANGE_PLAN, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1128';
export const tests = ['change/F56'];
export const title = 'the scope is derived from the ids the Change names, with no list: Cases in the folder and Cases beside the named elements are in scope; a Case a PLAN adds that tests an id the Change does not name is a finding';
export async function run() {
  const c = await load();
  const named = { ...done(), [`${FOLDER}/C1.md`]: '# p/C1\nTargets p/F2 and closes p/G1.\n' };
  const inScope = c.scope(view(named), FOLDER).sort();
  assert.deepEqual(inScope, [`${FOLDER}/T10.test.mjs`, `${FOLDER}/T11.test.mjs`, `${P}/02-requirements/F2-new/T12.test.mjs`], 'the scope is not the folder plus the Cases beside named elements');
  assert.ok(!inScope.includes(`${P}/02-requirements/F1-old/T1.test.mjs`), 'an unrelated element Case is in scope');
  assert.deepEqual([...c.named(view(named), FOLDER)].sort(), ['p/C1', 'p/F2', 'p/G1']);
  assert.deepEqual(c.judgeNaming({ base: view(named), head: view(named), folder: FOLDER }), [], 'no Case was added');
  const added = { ...named, [`${P}/02-requirements/F9-surprise/T40.test.mjs`]: kase('p/T40', 'p/F9') };
  assert.deepEqual(c.judgeNaming({ base: view(named), head: view(added), folder: FOLDER }).map((f) => [f.rule, f.path]), [['case-not-named', `${P}/02-requirements/F9-surprise/T40.test.mjs`]]);
  const adjusted = { ...added, [`${FOLDER}/C1.md`]: '# p/C1\nTargets p/F2 and p/F9, closes p/G1.\n' };
  assert.deepEqual(c.judgeNaming({ base: view(named), head: view(adjusted), folder: FOLDER }), [], 'a named Gap is a finding');
}
test(id, () => run());
