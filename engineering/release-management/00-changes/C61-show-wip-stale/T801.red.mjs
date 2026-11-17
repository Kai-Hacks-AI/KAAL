// Case release/T801 tests: release/C61
import assert from 'node:assert/strict';
import { config, entryOf, facts, load, piece, scriptPath } from './fixtures.mjs';
export const id = 'release/T801';
export const tests = ['release/C61'];
export const title = 'only an empty or done branch with no open piece is a candidate: a branch with an open piece, an open branch, an unknown branch and the default branch never are';
export async function run() {
  const { showWip } = await load(scriptPath);
  const names = [
    facts('main', { ahead: 0, promoted: false }),
    facts('kaal/release/empty', { ahead: 0, promoted: false }),
    facts('kaal/release/done', { ahead: 2, promoted: true }),
    facts('kaal/release/busy', { ahead: 0, promoted: false }),
    facts('kaal/release/open', { ahead: 2, promoted: false }),
    facts('kaal/release/unknown'),
  ];
  const report = showWip({ pieces: [piece(1, { from: 'kaal/release/busy' })], branches: names, gaps: [] }, config());
  const candidate = (b) => entryOf(report, b)?.candidate;
  assert.equal(candidate('kaal/release/empty'), true);
  assert.equal(candidate('kaal/release/done'), true);
  assert.equal(candidate('kaal/release/busy'), false, 'a branch with an open piece is a candidate');
  assert.equal(candidate('kaal/release/open'), false);
  assert.equal(candidate('kaal/release/unknown'), false);
  assert.equal(entryOf(report, 'main'), undefined, 'the default branch is in the inventory');
}
