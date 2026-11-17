// Case release/T801 tests: release/C61
import assert from 'node:assert/strict';
import { config, entryOf, facts, load, merged, closed, piece, scriptPath } from './fixtures.mjs';
export const id = 'release/T801';
export const tests = ['release/C61'];
export const title = 'insufficient or conflicting evidence is never settled: an open piece, commits added after delivery, no commit and no piece, and a missing fact are not settled, whatever Git says';
export async function run() {
  const { showWip } = await load(scriptPath);
  const names = [
    facts('main', { head: 'm1', ahead: 0, settled: false }),
    facts('kaal/release/ok', { head: 'a1', ahead: 2, settled: merged('a1') }),
    facts('kaal/release/open', { head: 'b1', ahead: 2, settled: merged('b1') }),
    facts('kaal/release/after', { head: 'c2', ahead: 1, settled: merged('c1') }),
    facts('kaal/release/aftergone', { head: 'd2', ahead: 0, settled: closed('d1') }),
    facts('kaal/release/nothing', { head: 'e1', ahead: 0, settled: false }),
    facts('kaal/release/nohead', { ahead: 2, settled: merged('f1') }),
    facts('kaal/release/nosettled', { head: 'g1', ahead: 2 }),
    facts('kaal/release/noahead', { head: 'h1', settled: false }),
  ];
  const report = showWip({ pieces: [piece(1, { from: 'kaal/release/open' })], branches: names, gaps: [] }, config());
  const e = (b) => entryOf(report, b);
  assert.deepEqual([e('kaal/release/ok').state, e('kaal/release/ok').settled], ['delivered', true]);
  assert.deepEqual([e('kaal/release/open').state, e('kaal/release/open').settled], ['wip', false], 'an open piece was settled');
  assert.deepEqual([e('kaal/release/after').state, e('kaal/release/after').settled], ['wip', false], 'commits after delivery were settled');
  assert.deepEqual([e('kaal/release/aftergone').state, e('kaal/release/aftergone').settled], ['UNKNOWN', false], 'a tip that differs from the piece with no commit beyond main was settled');
  assert.deepEqual([e('kaal/release/nothing').state, e('kaal/release/nothing').settled], ['UNKNOWN', false], 'a branch with no commit and no piece was settled');
  for (const b of ['nohead', 'nosettled', 'noahead']) assert.deepEqual([e(`kaal/release/${b}`).state, e(`kaal/release/${b}`).settled], ["UNKNOWN", false], `${b} was settled`);
  assert.equal(entryOf(report, 'main'), undefined, 'the default branch is in the inventory');
}
