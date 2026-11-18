// Case change/T1058 tests: change/F55
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1058';
export const tests = ['change/F55'];
export const title = 'a deleted Change registration fails retirement when the folder holds no act.md, when a file of the folder is removed, or when a touched element has no target Case';
export async function run() {
  const c = await load();
  const run = (head, before = done()) => c.judgeRetirement({ before: view(before), head: view(head), from: view(from()) });
  const { [`${FOLDER}/kaal-guard.json`]: _gone, ...noAct } = done();
  assert.deepEqual(run(noAct).map((f) => f.rule), ['not-closed']);
  const { [`${FOLDER}/T11.test.mjs`]: _t, ...lost } = acted();
  assert.deepEqual(run(lost).map((f) => [f.rule, f.path]), [['history-removed', `${FOLDER}/T11.test.mjs`]]);
  const bare = done(); delete bare[`${P}/02-requirements/F2-new/T12.test.mjs`];
  assert.deepEqual(run(acted(bare), bare).map((f) => [f.rule, f.path]), [['touched-element-without-target-case', `${P}/02-requirements/F2-new`]]);
}
test(id, () => run());
