// Case change/T1055 tests: change/F53
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, view, from, done, acted, kase, green, evidence, evaluation, CAPABILITY_PLAN, CHANGE_PLAN, P, FOLDER, REGISTRATION } from '../../test/folder-control-support.mjs';
export const id = 'change/T1055';
export const tests = ['change/F53'];
export const title = 'a Change folder is closed when it holds act.md; the state is derived from the PR views (open, closing when act.md is added, closed when it was already there); the registration stays and is passive: one that runs Cases directly is a finding; a closed state passes without running anything';
export async function run() {
  const c = await load();
  assert.equal(c.closed(view(done()), FOLDER), false, 'an open folder is closed');
  assert.equal(c.closed(view(acted()), FOLDER), true, 'a folder with act.md is open');
  assert.equal(c.stateOf({ base: view(done()), head: view(done()) }, FOLDER), 'open');
  assert.equal(c.stateOf({ base: view(done()), head: view(acted()) }, FOLDER), 'closing');
  assert.equal(c.stateOf({ base: view(acted()), head: view(acted()) }, FOLDER), 'closed');
  assert.deepEqual(c.verdict({ state: 'closed', counts: { red: 9, green: 0, unknown: 9 } }), [], 'a closed Change ran');
  assert.deepEqual(c.judgeFolders(view(acted())), [], 'a closed folder that keeps its passive registration is judged');
  const direct = { ...acted(), [`${FOLDER}/kaal-guard.json`]: JSON.stringify({ checks: [{ id: 'cases', run: `node --test "${FOLDER}/T*.test.mjs"` }] }) };
  assert.deepEqual(c.judgeFolders(view(direct)).filter((f) => f.rule === 'registration-not-passive').map((f) => f.path), [`${FOLDER}/kaal-guard.json`], 'a registration that runs Cases directly (stale after closing) was not found');
}
test(id, () => run());
