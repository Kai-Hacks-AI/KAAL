// Case pull/T26 tests: pull/F25, pull/F26
import assert from 'node:assert/strict';
import { carried, declaration, drop, facts, good, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T26';
export const tests = ['pull/F25', 'pull/F26'];
export const title = 'the walk gives one entry per declared collector in the declared order, and PLAN and DO are read from the collector\'s head tree (not only from the delta against main, which says whether there is anything to promote), never from a pull request';
const only = async (collector, d = declaration({ collectors: [{ name: 'col-a' }] })) => statusOf(await walkCollectors({ collectors: [collector] }, d), 'col-a');
export async function run() {
  const result = await walkCollectors(facts(), declaration());
  assert.deepEqual(result.collectors.map((c) => c.name), ['col-a', 'col-b', 'col-c'], 'the entries are not the declared collectors in the declared order');
  assert.ok(result.collectors.every((c) => c.status === 'qualifies'), `a complete collector does not qualify: ${JSON.stringify(result.collectors.map((c) => [c.name, c.status, c.missing]))}`);
  // a declared collector the host lacks, an undeclared host collector, and the order of the facts
  const lacking = await walkCollectors({ collectors: [good('col-a'), good('col-c'), good('col-z')] }, declaration());
  assert.equal(statusOf(lacking, 'col-b').status, 'not judged');
  assert.ok(statusOf(lacking, 'col-b').missing.some((m) => /collector/.test(m)), 'the missing collector is not named');
  assert.deepEqual(lacking.undeclared, ['col-z']);
  assert.equal(JSON.stringify(await walkCollectors({ collectors: [...facts().collectors].reverse() }, declaration())), JSON.stringify(result), 'the order of the facts changes the result');
  assert.ok((await walkCollectors(facts(), declaration({ collectors: [] }))).problems.length > 0, 'an empty declaration is not reported');

  // PLAN: at least one PLAN file in the tree
  const noPlan = await only(good('col-a', { ...drop(good('col-a'), 'plan/x/requirements.md', 'plan/x/testing.md') }));
  assert.equal(noPlan.status, 'does not qualify');
  assert.ok(noPlan.missing.some((m) => /PLAN/.test(m)), 'the missing PLAN is not named');
  // one PLAN file is enough: 1..n
  assert.equal((await only(good('col-a', { ...drop(good('col-a'), 'plan/x/testing.md') }))).status, 'qualifies');
  // DO: at least one implementation file
  const noDo = await only(good('col-a', { ...drop(good('col-a'), 'src/script.mjs') }));
  assert.equal(noDo.status, 'does not qualify');
  assert.ok(noDo.missing.some((m) => /DO/.test(m)), 'the missing DO is not named');
  // a removed file is not a PLAN or a DO: removed from the tree it never counts
  const removed = await only(good('col-a', { ...drop(good('col-a'), 'src/script.mjs'), delta: [...drop(good('col-a'), 'src/script.mjs').delta, { path: 'src/script.mjs', status: 'removed' }] }));
  assert.equal(removed.status, 'does not qualify', 'a removed file counted as the DO');
  // nothing differs from main, though the tree holds all the evidence
  const empty = await only(good('col-a', { delta: [], history: [] }));
  assert.equal(empty.status, 'does not qualify');
  assert.ok(empty.missing.some((m) => /delta|main/.test(m)), 'an empty delta is not explained');
  // PLAN and DO already in the tree, not in the delta: they count
  const carriedOk = await only(carried('col-a'));
  assert.equal(carriedOk.status, 'qualifies', `evidence in the tree but not in the delta did not count: ${JSON.stringify(carriedOk.missing)}`);
  // and the same collector without them in the tree does not qualify, naming both
  const bare = await only(carried('col-a', { tree: carried('col-a').tree.filter((p) => !/^plan\/x\/(requirements|testing)|^src\//.test(p)) }));
  assert.equal(bare.status, 'does not qualify');
  assert.ok(bare.missing.some((m) => /PLAN/.test(m)) && bare.missing.some((m) => /DO/.test(m)), 'the missing PLAN and DO are not named');
}
