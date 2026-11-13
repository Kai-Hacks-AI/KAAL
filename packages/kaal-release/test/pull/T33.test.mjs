// Case pull/T33 tests: pull/F34
import assert from 'node:assert/strict';
import { HEADINGS, declaration, evidence, execution, file, good, retro, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T33';
export const tests = ['pull/F34'];
export const title = 'with the Change-history retrospectives declared, exactly one concluding collector-level 4L ACT qualifies after them, and the history retrospectives neither count nor make the collector ambiguous';
const HIST = ['^plan/.*00-changes\\.md$'];
const act = (history = HIST) => ({ files: ['(^|/)concluding-act\\.md$'], headings: HEADINGS, ...(history ? { history } : {}) });
const decl = (history) => declaration({ collectors: [{ name: 'col-a' }], evidence: evidence({ act: act(history) }) });
const only = async (collector, history) => statusOf(await walkCollectors({ collectors: [collector] }, decl(history)), 'col-a');
const commit = (id, ...paths) => ({ id, paths });
// Three Change-history retrospectives and one concluding ACT in the last commit, after the PLAN, DO and Cases.
function collector(over = {}) {
  const base = good('col-a');
  const retros = ['plan/x/00-changes.md', 'plan/y/00-changes.md', 'plan/z/00-changes.md'];
  const history = [...base.history.slice(0, 3), commit('col-a-4', ...retros), commit('col-a-head', 'concluding-act.md')];
  const delta = [...base.delta.filter((f) => f.path !== 'plan/x/00-changes.md'), ...[...retros, 'concluding-act.md'].map((p) => file(p, 'added'))];
  return { ...base, history, delta, tree: [...new Set([...base.tree, ...delta.map((f) => f.path)])], texts: { 'concluding-act.md': retro() }, ...over };
}
export async function run() {
  assert.equal((await only(collector())).status, 'qualifies', 'one concluding ACT after three history retrospectives did not qualify');
  // none concluding: the history retrospectives are not the conclusion
  const none = await only(collector({ delta: collector().delta.filter((f) => f.path !== 'concluding-act.md'), texts: {}, history: collector().history.slice(0, -1).concat(commit('col-a-head', 'README.md')) }));
  assert.equal(none.status, 'does not qualify', 'history retrospectives were taken for the conclusion');
  assert.ok(none.missing.some((m) => /ACT/.test(m)), 'the missing concluding ACT is not named');
  // two concluding ACTs, an incomplete one, one that was not read
  const two = collector({ delta: [...collector().delta, file('sub/concluding-act.md', 'added')], texts: { 'concluding-act.md': retro(), 'sub/concluding-act.md': retro() }, history: [...collector().history.slice(0, -1), commit('col-a-5', 'sub/concluding-act.md'), collector().history.at(-1)] });
  const bad = await only(two);
  assert.equal(bad.status, 'does not qualify');
  assert.ok(bad.missing.some((m) => /concluding-act\.md/.test(m) && /sub\/concluding-act\.md/.test(m)), 'the two concluding ACTs are not named');
  assert.equal((await only(collector({ texts: { 'concluding-act.md': retro(['Liked', 'Learned']) } }))).status, 'does not qualify', 'an incomplete retrospective concluded the work');
  assert.equal((await only(collector({ texts: {} }))).status, 'not judged', 'an unread concluding ACT was taken for a pass');
  // a history retrospective is not read: its text may be absent or incomplete
  assert.equal((await only(collector({ texts: { 'concluding-act.md': retro(), 'plan/x/00-changes.md': 'no headings' } }))).status, 'qualifies', 'a history retrospective was judged');
  // the conclusion comes after every history retrospective, by position
  const c = collector();
  const late = await only({ ...c, history: [...c.history.slice(0, 3), commit('col-a-4', 'plan/x/00-changes.md', 'plan/z/00-changes.md'), commit('col-a-5', 'concluding-act.md'), commit('col-a-head', 'plan/y/00-changes.md')] });
  assert.equal(late.status, 'does not qualify', 'a history retrospective changed after the concluding ACT did not break it');
  assert.ok(late.missing.some((m) => m.includes('plan/y/00-changes.md')), 'the history retrospective changed after the ACT is not named');
  const sameCommit = await only({ ...c, history: [...c.history.slice(0, 3), commit('col-a-head', 'plan/x/00-changes.md', 'plan/y/00-changes.md', 'plan/z/00-changes.md', 'concluding-act.md')] });
  assert.equal(sameCommit.status, 'qualifies', 'the same commit was taken for "after"');
  // a history retrospective the history never places cannot be ordered
  const unplaced = await only({ ...c, history: c.history.map((h) => ({ ...h, paths: h.paths.filter((p) => p !== 'plan/z/00-changes.md') })) });
  assert.equal(unplaced.status, 'not judged', 'an unplaced history retrospective was ignored');
  assert.ok(unplaced.missing.some((m) => m.includes('plan/z/00-changes.md')), 'the unplaced history retrospective is not named');
  // a file in both lists is a history file
  assert.equal((await only(collector({ delta: collector().delta, texts: collector().texts }), ['^plan/.*00-changes\\.md$', '(^|/)concluding-act\\.md$'])).status, 'does not qualify', 'a file in both lists was taken for the conclusion');
  // without history the approved behaviour holds: every matching retrospective is a candidate
  const approved = { ...collector(), delta: [...collector().delta, file('plan/q/concluding-act.md', 'added')], texts: { 'concluding-act.md': retro(), 'plan/q/concluding-act.md': retro() }, history: [...collector().history.slice(0, -1), commit('col-a-5', 'plan/q/concluding-act.md'), collector().history.at(-1)] };
  assert.equal((await only(approved, null)).status, 'does not qualify', 'without history two matching retrospectives did not count as two');
  void execution;
}
