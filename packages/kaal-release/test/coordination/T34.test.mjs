// Case coordination/T34 tests: F4, F5 (type and disposition)
import assert from 'node:assert/strict';
import { byRef, config, piece, showWip } from './fixtures.mjs';
export const id = 'coordination/T34';
export const tests = ['coordination/F4', 'coordination/F5'];
export const title = 'the type is the declared title prefix, else unknown; each WORK cause, REVIEW and both WAITs are reached from observed facts with a short reason, and the first WORK cause wins';
const expect = async (over, disposition, reason) => {
  const report = await showWip({ pieces: [piece(1, over)], gaps: [] }, config());
  const got = byRef(report, '#1');
  assert.equal(got.disposition, disposition, `${JSON.stringify(over)}: ${got.disposition} ${got.reason}`);
  assert.match(got.reason, reason, `${JSON.stringify(over)}: the reason is "${got.reason}"`);
  assert.ok(got.reason.length < 80, 'the reason is not short');
  return got;
};
export async function run() {
  await expect({}, 'WAIT', /landing/i);
  await expect({ draft: true }, 'WORK', /draft/i);
  await expect({ review: 'changes' }, 'WORK', /changes requested/i);
  await expect({ threads: 2 }, 'WORK', /2 .*thread/i);
  await expect({ fit: 'conflicts' }, 'WORK', /conflict/i);
  await expect({ fit: 'behind' }, 'WORK', /behind/i);
  await expect({ checks: 'failure' }, 'WORK', /check.*fail/i);
  await expect({ landing: false }, 'WORK', /not.*land/i);
  await expect({ review: 'none' }, 'REVIEW', /approval/i);
  await expect({ checks: 'pending' }, 'WAIT', /running/i);
  await expect({ review: 'none', checks: 'pending' }, 'WAIT', /running/i);
  await expect({ checks: 'none' }, 'WAIT', /landing/i);
  await expect({ draft: true, review: 'changes', threads: 3, fit: 'conflicts' }, 'WORK', /draft/i);
  await expect({ review: 'none', landing: false }, 'REVIEW', /approval/i);

  const report = await showWip({ pieces: [piece(2, { title: 'PROMOTION: promote' }), piece(3, { title: 'Update things' }), piece(4, { title: 'REVERT: undo' }), piece(5, { title: 'SYNC: update' })], gaps: [] }, config());
  assert.deepEqual(['#2', '#3', '#4', '#5'].map((r) => byRef(report, r).type), ['PROMOTION', 'unknown', 'unknown', 'SYNC'], 'the type is not the declared prefix');
}
