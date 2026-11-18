// Case change/T1055 tests: change/F53
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1055';
export const tests = ['change/F53'];
export const title = 'a Change folder is closed when it holds act.md, and a closed folder that still holds its registration is a stale registration';
export async function run() {
  const c = await load();
  assert.equal(c.closed(view(done()), FOLDER), false, 'an open folder is closed');
  assert.equal(c.closed(view(acted()), FOLDER), true, 'a folder with act.md is open');
  const stale = { ...acted(), [`${FOLDER}/kaal-guard.json`]: REGISTRATION };
  assert.deepEqual(c.judgeFolders(view(stale)).filter((f) => f.rule === 'stale-registration').map((f) => f.path), [`${FOLDER}/kaal-guard.json`]);
  assert.deepEqual(c.judgeFolders(view(done())).filter((f) => f.rule === 'stale-registration'), [], 'an open Change was judged stale');
}
test(id, () => run());
