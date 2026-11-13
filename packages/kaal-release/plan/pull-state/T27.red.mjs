// Case pull/T27 tests: pull/F27
import assert from 'node:assert/strict';
import { declaration, evidence, execution, good, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T27';
export const tests = ['pull/F27'];
export const title = 'CHECK is the latest execution, at the exact head of the collector, of every expected Test Case, including the Cases the delta did not change: green qualifies, a failure names the Case, and a missing, pending or older-head execution is not judged';
const only = async (over, ev) => statusOf(await walkCollectors({ collectors: [good('col-a', over)] }, declaration({ collectors: [{ name: 'col-a' }], ...(ev ? { evidence: ev } : {}) })), 'col-a');
const H = 'col-a-head';
const all = (...more) => [execution('T0', H), execution('T1', H), execution('T2', H), ...more];
export async function run() {
  assert.equal((await only({})).status, 'qualifies');
  // a failure of an expected Case at the head
  const red = await only({ executions: [execution('T0', H), execution('T1', H), execution('T2', H, 'failure')] });
  assert.equal(red.status, 'does not qualify');
  assert.ok(red.missing.some((m) => /T2/.test(m)), 'the failing Case is not named');
  // the latest execution wins, in both directions
  assert.equal((await only({ executions: all(execution('T2', H, 'failure', '2026-11-12T05:00:00Z'), execution('T2', H, 'success', '2026-11-12T07:00:00Z')).filter((e) => !(e.case === 'T2' && e.at === '2026-11-12T06:00:00Z')) })).status, 'qualifies', 'an earlier red outlived a later green');
  assert.equal((await only({ executions: all(execution('T2', H, 'failure', '2026-11-12T07:00:00Z')) })).status, 'does not qualify', 'an earlier green outlived a later red');
  // an expected Case that never ran at this head, executions at an older head, a pending latest, nothing reported
  const none = await only({ executions: [execution('T0', H), execution('T1', H)] });
  assert.equal(none.status, 'not judged');
  assert.ok(none.missing.some((m) => /T2/.test(m)), 'the Case without an execution is not named');
  assert.equal((await only({ executions: [execution('T0', H), execution('T1', H), execution('T2', 'col-a-older')] })).status, 'not judged', 'an execution at an older head counted');
  assert.equal((await only({ executions: [execution('T0', H), execution('T1', H), execution('T2', H, 'pending')] })).status, 'not judged');
  assert.equal((await only({ executions: undefined })).status, 'not judged');
  // a failure and an unjudged Case together: the failure is named and the collector does not qualify
  assert.equal((await only({ executions: [execution('T1', H, 'failure')] })).status, 'does not qualify');

  // the expected set is every Case of the head tree, not only the Cases the delta changed: T0 is unchanged and still required
  const noT0 = await only({ executions: [execution('T1', H), execution('T2', H)] });
  assert.equal(noT0.status, 'not judged', 'an unchanged Case was not required');
  assert.ok(noT0.missing.some((m) => /T0/.test(m)), 'the unchanged Case without an execution is not named');
  const redT0 = await only({ executions: [execution('T0', H, 'failure'), execution('T1', H), execution('T2', H)] });
  assert.equal(redT0.status, 'does not qualify', 'a red unchanged Case did not block the collector');
  assert.ok(redT0.missing.some((m) => /T0/.test(m)));
  // a Case the declaration pins as required but the tree no longer holds: the set cannot shrink silently
  const pinned = await only({ executions: [...all(), execution('T9', H)] }, evidence({ cases: { files: '^test/(T\\d+)\\.test\\.mjs$', required: ['T0', 'T9'] } }));
  assert.equal(pinned.status, 'does not qualify', 'a required Case that the tree lacks was ignored');
  assert.ok(pinned.missing.some((m) => /T9/.test(m)), 'the missing required Case is not named');
  // a tree without any Case file: nothing to check is not a pass
  const tree = good('col-a').tree.filter((p) => !/^test\//.test(p));
  const noCase = await only({ tree, executions: [] });
  assert.equal(noCase.status, 'not judged');
  assert.ok(noCase.missing.some((m) => /Test Case/i.test(m)), 'a tree without an expected Case is not explained');
  // an execution for a Case the tree does not hold is not an expected Case
  assert.equal((await only({ executions: all(execution('T7', H, 'failure')) })).status, 'qualifies', 'an execution of a Case that is not expected blocked the collector');
}
