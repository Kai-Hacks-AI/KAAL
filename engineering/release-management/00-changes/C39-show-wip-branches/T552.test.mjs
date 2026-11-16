// Case release/T552 tests: C39 (acceptance example 4: a closed or merged PR changes its transport, not the branch)
import assert from 'node:assert/strict';
import { branches, config, entryOf, load, piece, scriptPath } from './fixtures.mjs';
export const id = 'release/T552';
export const tests = ['release/C39'];
export const title = 'when the PR of a branch is no longer open, the branch stays in the inventory with one transport less';
export async function run() {
  const { showWip } = await load(scriptPath);
  const names = branches('kaal/release/a');
  const open = showWip({ pieces: [piece(1, { from: 'kaal/release/a' })], branches: names, gaps: [] }, config());
  const closed = showWip({ pieces: [], branches: names, gaps: [] }, config());
  assert.equal(entryOf(open, 'kaal/release/a').transports.length, 1);
  assert.ok(entryOf(closed, 'kaal/release/a'), 'the branch was deleted from the inventory with its PR');
  assert.deepEqual(entryOf(closed, 'kaal/release/a').transports, []);
  const gone = showWip({ pieces: [], branches: [], gaps: [] }, config());
  assert.equal(entryOf(gone, 'kaal/release/a'), undefined, 'a branch that no longer exists is still listed');
}
