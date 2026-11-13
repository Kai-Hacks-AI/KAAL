// Case pull/T27 tests: pull/F27
import assert from 'node:assert/strict';
import { declaration, execution, good, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T27';
export const tests = ['pull/F27'];
export const title = 'CHECK is the latest execution of each expected Test Case on the current head of the collector: green qualifies, a failure names the Case, and a missing, pending or older-head execution is not judged, never a pass';
const only = async (over) => statusOf(await walkCollectors({ collectors: [good('col-a', over)] }, declaration({ collectors: [{ name: 'col-a' }] })), 'col-a');
const H = 'col-a-head';
export async function run() {
  assert.equal((await only({})).status, 'qualifies');
  // a failure of an expected Case at the head
  const red = await only({ executions: [execution('T1', H), execution('T2', H, 'failure')] });
  assert.equal(red.status, 'does not qualify');
  assert.ok(red.missing.some((m) => /T2/.test(m)), 'the failing Case is not named');
  // the latest execution wins over an earlier red
  const fixed = await only({ executions: [execution('T1', H), execution('T2', H, 'failure', '2026-11-12T05:00:00Z'), execution('T2', H, 'success', '2026-11-12T07:00:00Z')] });
  assert.equal(fixed.status, 'qualifies', 'an earlier red outlived a later green');
  // and a later red wins over an earlier green
  const broke = await only({ executions: [execution('T1', H), execution('T2', H, 'success', '2026-11-12T05:00:00Z'), execution('T2', H, 'failure', '2026-11-12T07:00:00Z')] });
  assert.equal(broke.status, 'does not qualify', 'an earlier green outlived a later red');
  // an expected Case that never ran at this head
  const none = await only({ executions: [execution('T1', H)] });
  assert.equal(none.status, 'not judged');
  assert.ok(none.missing.some((m) => /T2/.test(m)), 'the Case without an execution is not named');
  // executions at an older head never count
  const old = await only({ executions: [execution('T1', H), execution('T2', 'col-a-older')] });
  assert.equal(old.status, 'not judged', 'an execution at an older head counted');
  // pending
  const pending = await only({ executions: [execution('T1', H), execution('T2', H, 'pending')] });
  assert.equal(pending.status, 'not judged');
  // no execution reported at all
  assert.equal((await only({ executions: undefined })).status, 'not judged');
  // a failure and an unjudged Case together: the failure is named and the collector does not qualify
  const both = await only({ executions: [execution('T1', H, 'failure')] });
  assert.equal(both.status, 'does not qualify');
  // no expected Test Case in the delta
  const delta = good('col-a').delta.filter((f) => !/^test\//.test(f.path));
  const noCase = await only({ delta, executions: [] });
  assert.equal(noCase.status, 'not judged');
  assert.ok(noCase.missing.some((m) => /Test Case/i.test(m)), 'a delta without an expected Case is not explained');
}
