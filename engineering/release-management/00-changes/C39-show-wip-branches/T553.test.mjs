// Case release/T553 tests: C39 (the places and the PR from a branch that was not listed)
import assert from 'node:assert/strict';
import { branches, config, entryOf, load, piece, placeOf, scriptPath } from './fixtures.mjs';
export const id = 'release/T553';
export const tests = ['release/C39'];
export const title = 'the place of a branch comes from the configured patterns, the first match wins, the rest is development, and a PR from a branch the list did not hold is shown as not observed';
export async function run() {
  const { showWip } = await load(scriptPath);
  const facts = { pieces: [piece(1, { from: 'hotfix/ghost', into: 'main' })], branches: branches('hotfix/a', 'kaal/hotfix/b', 'main'), gaps: [] };
  const report = showWip(facts, config());
  assert.equal(entryOf(report, 'hotfix/a').place, 'hotfix');
  assert.equal(entryOf(report, 'kaal/hotfix/b').place, 'kaal', 'a pattern matched in the middle of a name');
  const ghost = entryOf(report, 'hotfix/ghost');
  assert.ok(ghost, 'a PR from an unlisted branch is dropped');
  assert.equal(ghost.listed, false, 'the entry does not say the branch was not in the list');
  assert.ok(report.notObserved.some((n) => n.includes('hotfix/ghost')), 'the unlisted branch is not in notObserved');
  assert.deepEqual(report.inventory.places.map((p) => p.place), ['hotfix', 'wire', 'kaal', 'development'], 'the places are not in the configured order, development last');
  assert.deepEqual(placeOf(report, 'wire').branches, [], 'an empty place is left out of the order');
  const none = showWip({ pieces: [], branches: branches('a'), gaps: [] }, config({ places: [], development: undefined }));
  assert.ok(entryOf(none, 'a'), 'with no place configured the branch is dropped');
  assert.equal(entryOf(none, 'a').place, 'unknown place', 'a branch no place matches is guessed');
}
