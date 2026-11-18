// Case change/T1056 tests: change/F54
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, green, evidence, evaluation, CAPABILITY_PLAN, CHANGE_PLAN, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1056';
export const tests = ['change/F54'];
export const title = 'inside a Change folder only change kinds are tested and described: a Case that tests a requirement, an architecture element, a control, an intent or a Defect, and a document of such a kind, is a finding that names the file; C and G pass';
export async function run() {
  const c = await load();
  assert.deepEqual(c.judgeFolders(view(done())), [], 'change-oriented Cases were judged defective');
  for (const id of ['p/F2', 'p/A3', 'p/CTL4', 'p/I5', 'p/N6', 'p/D2']) {
    const files = { ...done(), [`${FOLDER}/T10.test.mjs`]: kase('p/T10', id) };
    const found = c.judgeFolders(view(files));
    assert.deepEqual(found.map((f) => [f.rule, f.path]), [['target-case-in-change-folder', `${FOLDER}/T10.test.mjs`]], `${id}: not found`);
    assert.ok(found[0].detail.includes('enduring'), `${id}: the finding does not say why`);
  }
  for (const doc of ['D1-defect.md', 'F9-late.md', 'CTL3-late.md']) {
    assert.deepEqual(c.judgeFolders(view({ ...done(), [`${FOLDER}/${doc}`]: 'x' })).map((f) => [f.rule, f.path]), [['target-document-in-change-folder', `${FOLDER}/${doc}`]], `${doc}: not found`);
  }
  assert.deepEqual(c.judgeFolders(view({ ...done(), [`${FOLDER}/G4-gap.md`]: 'x', [`${FOLDER}/change.md`]: 'x' })), [], 'a Gap document or a plain record was judged');
}
test(id, () => run());
