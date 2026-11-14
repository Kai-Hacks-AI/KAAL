// Case pull/T28 tests: pull/F28
import assert from 'node:assert/strict';
import { declaration, file, good, retro, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T28';
export const tests = ['pull/F28'];
export const title = 'ACT is exactly one concluding 4L retrospective, ordered by the collector\'s history and not by timestamps: after the last PLAN, DO and Case change, at the exact head being qualified; a later change to any of them, none, two, an incomplete one or a history that does not end at the head does not qualify';
const only = async (over) => statusOf(await walkCollectors({ collectors: [good('col-a', over)] }, declaration({ collectors: [{ name: 'col-a' }] })), 'col-a');
const base = () => good('col-a');
const commit = (id, ...paths) => ({ id, paths });
export async function run() {
  assert.equal((await only({})).status, 'qualifies');
  // no ACT in the delta
  const none = await only({ delta: base().delta.filter((f) => f.path !== 'plan/x/00-changes.md'), tree: base().tree.filter((p) => p !== 'plan/x/00-changes.md') });
  assert.equal(none.status, 'does not qualify');
  assert.ok(none.missing.some((m) => /ACT/.test(m)), 'the missing ACT is not named');
  // a file that matches but is not a 4L retrospective is not an ACT
  assert.equal((await only({ texts: { 'plan/x/00-changes.md': retro(['Liked', 'Learned']) } })).status, 'does not qualify', 'an incomplete retrospective counted as the ACT');
  // exactly one: a second retrospective is not a conclusion
  const h = base().history;
  const two = await only({
    delta: [...base().delta, file('plan/y/00-changes.md', 'added')], tree: [...base().tree, 'plan/y/00-changes.md'],
    history: [...h.slice(0, -1), commit('col-a-4', 'plan/y/00-changes.md'), h.at(-1)],
    texts: { 'plan/x/00-changes.md': retro(), 'plan/y/00-changes.md': retro() },
  });
  assert.equal(two.status, 'does not qualify');
  assert.ok(two.missing.some((m) => /plan\/x\/00-changes\.md/.test(m) && /plan\/y\/00-changes\.md/.test(m)), 'the two retrospectives are not named');

  // order is the history's: a DO, PLAN or Case file changed in a commit after the ACT's commit breaks it
  const after = (path) => [...h.slice(0, -1).map((c) => ({ ...c, paths: c.paths.filter((p) => p !== path) })), commit('col-a-5', 'plan/x/00-changes.md'), { id: 'col-a-head', paths: [path] }].filter((c) => c.paths.length);
  for (const path of ['src/script.mjs', 'plan/x/testing.md', 'test/T1.test.mjs']) {
    const late = await only({ history: after(path) });
    assert.equal(late.status, 'does not qualify', `a change of ${path} after the ACT did not break the conclusion`);
    assert.ok(late.missing.some((m) => m.includes(path)), `${path}, changed after the ACT, is not named`);
  }
  // a later change that is no PLAN, DO or Case file does not break it, and the head is still the one checked
  const tail = await only({ history: [...h, commit('col-a-after', 'README.md')], at: 'col-a-after', executions: ['T0', 'T1', 'T2'].map((c) => ({ case: c, head: 'col-a-after', conclusion: 'success', at: '2026-11-12T06:00:00Z' })) });
  assert.equal(tail.status, 'qualifies', 'a later change outside PLAN, DO and the Cases broke the conclusion');
  // the same commit is not "after"
  assert.equal((await only({ history: [...h.slice(0, -1), commit('col-a-head', 'plan/x/00-changes.md', 'src/script.mjs')].map((c) => (c.id === 'col-a-2' ? { ...c, paths: [] } : c)).filter((c) => c.paths.length) })).status, 'qualifies');
  // not tied to the head: a history that ends elsewhere than the collector's head is not judged, and an execution at the ACT's commit is not enough
  const stale = await only({ history: h.slice(0, -1) });
  assert.equal(stale.status, 'not judged', 'a history that does not end at the head qualified');
  assert.ok(stale.missing.some((m) => /head/.test(m)), 'the missing tie to the head is not named');
  // a PLAN or DO file the history never touches is carried from main and does not break the order
  assert.equal((await only({ history: h.map((c) => ({ ...c, paths: c.paths.filter((p) => p !== 'src/script.mjs') })).filter((c) => c.paths.length) })).status, 'qualifies');
  // but the ACT the history never places cannot be ordered
  assert.equal((await only({ history: h.map((c) => ({ ...c, paths: c.paths.filter((p) => p !== 'plan/x/00-changes.md').concat(c.id === 'col-a-head' ? ['README.md'] : []) })) })).status, 'not judged');
  // timestamps are not authority: changedAt, mtime and times in the delta change nothing
  const stamped = await only({ delta: base().delta.map((f) => ({ ...f, changedAt: f.path === 'plan/x/00-changes.md' ? '2020-01-01T00:00:00Z' : '2030-01-01T00:00:00Z', mtime: 1 })) });
  assert.equal(stamped.status, 'qualifies', 'timestamps decided the order');
  // the text of a candidate was not read
  const unread = await only({ texts: {} });
  assert.equal(unread.status, 'not judged');
  assert.ok(unread.missing.some((m) => /plan\/x\/00-changes\.md/.test(m)), 'the unread candidate is not named');
}
