// Case release/T800 tests: release/C61
import assert from 'node:assert/strict';
import { config, entryOf, facts, load, scriptPath } from './fixtures.mjs';
export const id = 'release/T800';
export const tests = ['release/C61'];
export const title = 'a branch with no commit beyond main is empty, one whose promotion landed is done, one with work is open, and one with neither fact is UNKNOWN and never a candidate';
export async function run() {
  const { showWip } = await load(scriptPath);
  const names = [
    facts('kaal/release/empty', { ahead: 0, promoted: false }),
    facts('kaal/release/done', { ahead: 3, promoted: true }),
    facts('kaal/release/open', { ahead: 3, promoted: false }),
    facts('kaal/release/unknown'),
  ];
  const report = showWip({ pieces: [], branches: names, gaps: [] }, config());
  const state = (b) => entryOf(report, b)?.state;
  assert.equal(state('kaal/release/empty'), 'empty');
  assert.equal(state('kaal/release/done'), 'done');
  assert.equal(state('kaal/release/open'), 'open');
  assert.equal(state('kaal/release/unknown'), 'UNKNOWN');
  assert.equal(entryOf(report, 'kaal/release/unknown').candidate, false, 'a branch with no facts is a candidate');
}
