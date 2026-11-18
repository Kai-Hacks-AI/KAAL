// Case change/T1059 tests: change/F55
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1059';
export const tests = ['change/F55'];
export const title = 'retirement passes a complete ACT, is not applied when no registration is deleted, and reads the Cases from the state after the deletion, so a diff that removes an element Case together with the registration is caught, and it names the retiring checks to replay';
export async function run() {
  const c = await load();
  assert.deepEqual(c.judgeRetirement({ before: view(done()), head: view(acted()), from: view(from()) }), [], 'a complete ACT fails');
  const edited = { ...done(), [`${P}/02-requirements/F1-old/F1.md`]: '# p/F1 changed\n' };
  assert.deepEqual(c.judgeRetirement({ before: view(done()), head: view(edited), from: view(from()) }), [], 'a diff that deletes no registration was judged');
  const stripped = acted(); delete stripped[`${P}/02-requirements/F2-new/T12.test.mjs`];
  const found = c.judgeRetirement({ before: view(done()), head: view(stripped), from: view(from()) });
  assert.deepEqual(found.map((f) => f.rule), ['touched-element-without-target-case'], 'a diff that removes the element Case together with the registration passed');
  assert.deepEqual(c.retiring({ before: view(done()), head: view(acted()) }), [{ folder: FOLDER, id: 'cases', run: `node --test "${FOLDER}/T*.test.mjs"` }], 'the retiring check is not named');
  assert.deepEqual(c.retiring({ before: view(done()), head: view(edited) }), [], 'a diff that deletes no registration retires a check');
}
test(id, () => run());
