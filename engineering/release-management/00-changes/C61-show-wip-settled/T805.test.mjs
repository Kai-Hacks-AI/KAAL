// Case release/T805 tests: release/C61
import assert from 'node:assert/strict';
import { load, readerPath } from './fixtures.mjs';
export const id = 'release/T805';
export const tests = ['release/C61'];
export const title = 'the newest closed or merged piece of a branch is what the reader reports as settled: none is false, a cut list is not observed';
export async function run() {
  const { settledOf } = await load(readerPath);
  const pull = (state, at, headRefOid) => ({ state, [state === 'MERGED' ? 'mergedAt' : 'closedAt']: at, headRefOid });
  assert.equal(settledOf({ pageInfo: { hasNextPage: false }, nodes: [] }), false);
  assert.equal(settledOf(undefined), undefined, 'a missing list was read as none');
  assert.equal(settledOf({ pageInfo: { hasNextPage: true }, nodes: [pull('MERGED', '2026-11-01', 'a1')] }), undefined, 'a cut list was read as complete');
  assert.deepEqual(settledOf({ pageInfo: { hasNextPage: false }, nodes: [pull('CLOSED', '2026-11-01', 'a1'), pull('MERGED', '2026-11-03', 'b1')] }), { outcome: 'merged', head: 'b1' });
  assert.deepEqual(settledOf({ pageInfo: { hasNextPage: false }, nodes: [pull('MERGED', '2026-11-01', 'a1'), pull('CLOSED', '2026-11-03', 'b1')] }), { outcome: 'closed', head: 'b1' }, 'an older merge outranked a newer close');
}
