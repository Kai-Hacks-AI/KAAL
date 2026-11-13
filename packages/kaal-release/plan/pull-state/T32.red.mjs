// Case pull/T32 tests: pull/F33
import assert from 'node:assert/strict';
import { HEADINGS, declaration, evidence, execution, file, good, retro, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T32';
export const tests = ['pull/F33'];
export const title = 'Cases and ACT files are discovered by every declared pattern: the package shape and the engineering shape both count, so no record shape can be left out silently';
const ev = evidence({
  cases: { files: ['^test/(T\\d+)\\.test\\.mjs$', '^00-changes/[^/]+/(E\\d+)\\.test\\.mjs$'] },
  act: { files: ['^plan/.*00-changes\\.md$', '(^|/)00-changes/[^/]+/act\\.md$'], headings: HEADINGS },
});
const only = async (collector) => statusOf(await walkCollectors({ collectors: [collector] }, declaration({ collectors: [{ name: 'col-a' }], evidence: ev })), 'col-a');
const withEngineering = (over = {}) => {
  const base = good('col-a');
  return {
    ...base,
    delta: [...base.delta, file('00-changes/C1-x/E1.test.mjs', 'added')],
    tree: [...base.tree, '00-changes/C1-x/E1.test.mjs'],
    history: [...base.history.slice(0, -1), { id: 'col-a-4', paths: ['00-changes/C1-x/E1.test.mjs'] }, base.history.at(-1)],
    executions: [...base.executions, execution('E1', 'col-a-head')],
    ...over,
  };
};
export async function run() {
  assert.equal((await only(withEngineering())).status, 'qualifies', 'a Case of the second pattern, green at the head, did not qualify');
  const red = await only(withEngineering({ executions: [...good('col-a').executions, execution('E1', 'col-a-head', 'failure')] }));
  assert.equal(red.status, 'does not qualify', 'a red Case of the second pattern did not count');
  assert.ok(red.missing.some((m) => /E1/.test(m)), 'the red Case of the second pattern is not named');
  const unrun = await only(withEngineering({ executions: good('col-a').executions }));
  assert.equal(unrun.status, 'not judged', 'a Case of the second pattern with no execution was taken for a pass');
  assert.ok(unrun.missing.some((m) => /E1/.test(m)), 'the unrun Case of the second pattern is not named');
  // omitting the second pattern is the declaration's choice: the Case is then not expected (this is what the declaration review guards)
  const omitted = declaration({ collectors: [{ name: 'col-a' }], evidence: evidence({ cases: { files: ['^test/(T\\d+)\\.test\\.mjs$'] }, act: ev.act }) });
  assert.equal(statusOf(await walkCollectors({ collectors: [withEngineering({ executions: good('col-a').executions })] }, omitted), 'col-a').status, 'qualifies');
  // ACT files of two patterns: the engineering shape is found, one of each shape is two retrospectives
  const base = good('col-a');
  const shaped = { ...base, delta: [...base.delta.filter((f) => f.path !== 'plan/x/00-changes.md'), file('00-changes/C1-x/act.md', 'added')], tree: [...base.tree.filter((p) => p !== 'plan/x/00-changes.md'), '00-changes/C1-x/act.md'], history: [...base.history.slice(0, -1), { id: 'col-a-head', paths: ['00-changes/C1-x/act.md'] }], texts: { '00-changes/C1-x/act.md': retro() } };
  assert.equal((await only(shaped)).status, 'qualifies', 'the ACT of the second pattern was not found');
  const both = await only({ ...shaped, delta: [...shaped.delta, file('plan/x/00-changes.md', 'added')], texts: { ...shaped.texts, 'plan/x/00-changes.md': retro() }, history: [...shaped.history.slice(0, -1), { id: 'col-a-4', paths: ['plan/x/00-changes.md'] }, shaped.history.at(-1)] });
  assert.equal(both.status, 'does not qualify', 'one retrospective of each shape counted as one');
}
