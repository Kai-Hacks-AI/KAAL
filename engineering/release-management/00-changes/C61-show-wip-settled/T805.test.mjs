// Case release/T805 tests: release/C61
import assert from 'node:assert/strict';
import { load, readerPath } from './fixtures.mjs';
export const id = 'release/T805';
export const tests = ['release/C61'];
export const title = 'the newest closed piece of a branch is what the reader reports as settled, delivered when it merged and only closed when it closed unmerged, never discarded: none is false, a missing or cut list is not observed';
export async function run() {
  const { settledOf } = await load(readerPath);
  const closed = (closed_at, sha, merged_at = null) => ({ state: 'closed', closed_at, merged_at, head: { sha } });
  assert.equal(settledOf([]), false);
  assert.equal(settledOf([{ state: 'open', head: { sha: 'a1' } }]), false, 'an open piece settled the branch');
  assert.equal(settledOf(undefined), undefined, 'a missing list was read as none');
  assert.equal(settledOf(Array.from({ length: 100 }, () => closed('2026-11-01', 'a1'))), undefined, 'a cut list was read as complete');
  assert.deepEqual(settledOf([closed('2026-11-01', 'a1'), closed('2026-11-03', 'b1', '2026-11-03')]), { outcome: 'delivered', head: 'b1' });
  assert.deepEqual(settledOf([closed('2026-11-01', 'a1', '2026-11-01'), closed('2026-11-03', 'b1')]), { outcome: 'closed', head: 'b1' }, 'an older merge outranked a newer close');
}
