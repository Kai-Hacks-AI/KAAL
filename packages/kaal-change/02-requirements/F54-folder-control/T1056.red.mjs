// Case change/T1056 tests: change/F54
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1056';
export const tests = ['change/F54'];
export const title = 'inside a Change folder only change kinds are tested: a Case that tests a requirement, an architecture element, a control or an intent is a finding that names the file and the id; C, G and D pass';
export async function run() {
  const c = await load();
  assert.deepEqual(c.judgeFolders(view(done())), [], 'change-oriented Cases were judged defective');
  for (const id of ['p/F2', 'p/A3', 'p/CTL4', 'p/I5', 'p/N6']) {
    const files = { ...done(), [`${FOLDER}/T10.test.mjs`]: kase('p/T10', id) };
    const found = c.judgeFolders(view(files));
    assert.deepEqual(found.map((f) => [f.rule, f.path]), [['target-case-in-change-folder', `${FOLDER}/T10.test.mjs`]], `${id}: not found`);
    assert.ok(found[0].detail.includes(id), `${id}: the finding does not name the id`);
  }
  assert.deepEqual(c.judgeFolders(view({ ...done(), [`${FOLDER}/T10.test.mjs`]: kase('p/T10', 'p/D2') })), [], 'a defect id is judged target-oriented');
}
test(id, () => run());
