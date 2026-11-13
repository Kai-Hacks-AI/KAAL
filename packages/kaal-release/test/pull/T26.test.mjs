// Case pull/T26 tests: pull/F25, pull/F26
import assert from 'node:assert/strict';
import { declaration, drop, facts, good, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T26';
export const tests = ['pull/F25', 'pull/F26'];
export const title = 'the walk gives one entry per declared collector in the declared order, and PLAN and DO are read from the files of the collector\'s delta against main, never from a pull request';
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

  // PLAN: at least one PLAN file in the delta
  const noPlan = await only(good('col-a', { ...drop(good('col-a'), 'plan/x/requirements.md', 'plan/x/testing.md') }));
  assert.equal(noPlan.status, 'does not qualify');
  assert.ok(noPlan.missing.some((m) => /PLAN/.test(m)), 'the missing PLAN is not named');
  // one PLAN file is enough: 1..n
  assert.equal((await only(good('col-a', { ...drop(good('col-a'), 'plan/x/testing.md') }))).status, 'qualifies');
  // DO: at least one implementation file
  const noDo = await only(good('col-a', { ...drop(good('col-a'), 'src/script.mjs') }));
  assert.equal(noDo.status, 'does not qualify');
  assert.ok(noDo.missing.some((m) => /DO/.test(m)), 'the missing DO is not named');
  // a removed file is not a PLAN or a DO
  const removed = await only(good('col-a', { delta: good('col-a').delta.map((f) => (f.path === 'src/script.mjs' ? { ...f, status: 'removed' } : f)) }));
  assert.equal(removed.status, 'does not qualify', 'a removed file counted as the DO');
  // nothing differs from main
  const empty = await only(good('col-a', { delta: [], history: [] }));
  assert.equal(empty.status, 'does not qualify');
  assert.ok(empty.missing.some((m) => /delta|main/.test(m)), 'an empty delta is not explained');
}
