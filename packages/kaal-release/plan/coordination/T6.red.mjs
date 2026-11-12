// Case coordination/T6 tests: F7
import assert from 'node:assert/strict';
import { coordinate, declaration, facts } from './fixtures.mjs';
export const id = 'coordination/T6';
export const tests = ['coordination/F7'];
export const title = 'a merged promotion releases the lane and the next candidate is offered; a surviving collector is not offered again';
export async function run() {
  const merged = { number: 30, title: 'PROMOTION: Make it available', base: 'main', head: 'col-a', headSha: 'a1', state: 'merged', ci: 'success', behind: false, unresolvedThreads: 0, review: { state: 'APPROVED', at: 'a1' }, autoMerge: true };
  const state = facts({
    collectors: [{ name: 'col-a', head: 'a1', behindTarget: 0 }, { name: 'col-b', head: 'b1', behindTarget: 0 }],
    requests: [merged],
  });
  const result = await coordinate(state, declaration({ candidates: ['col-a', 'col-b'] }));
  assert.equal(result.actions.filter((a) => a.target === 'col-a').length, 0, 'a collector whose promotion merged is offered again');
  const next = result.actions.find((a) => a.action === 'OPEN PR' && a.target === 'col-b' && a.kind === 'promotion');
  assert.ok(next, 'the next candidate is not offered after the promotion merged');
  assert.equal(next.status, 'ready', 'the lane is not released by a merged promotion');
}
