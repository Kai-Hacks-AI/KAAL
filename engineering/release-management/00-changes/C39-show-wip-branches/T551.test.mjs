// Case release/T551 tests: C39 (acceptance examples 2 and 3: one entry per branch, one reference per PR)
import assert from 'node:assert/strict';
import { branches, config, entryOf, load, piece, scriptPath } from './fixtures.mjs';
export const id = 'release/T551';
export const tests = ['release/C39'];
export const title = 'a branch with one outgoing PR has one entry and one transport; with three PRs it still has one entry and three transports, each with its target and its disposition';
export async function run() {
  const { showWip } = await load(scriptPath);
  const facts = {
    branches: branches('kaal/release/a', 'kaal/release/b'),
    pieces: [
      piece(1, { from: 'kaal/release/a', into: 'main' }),
      piece(2, { from: 'kaal/release/b', into: 'main' }),
      piece(3, { from: 'kaal/release/b', into: 'kaal/release/a', checks: 'failure' }),
      piece(4, { from: 'kaal/release/b', into: 'kaal/release/c', draft: true }),
    ],
    gaps: [],
  };
  const report = showWip(facts, config());
  const kaal = report.inventory.places.find((p) => p.place === 'kaal');
  assert.equal(kaal.branches.filter((b) => b.branch === 'kaal/release/b').length, 1, 'three PRs made more than one entry');
  assert.deepEqual(entryOf(report, 'kaal/release/a').transports.map((t) => t.ref), ['#1']);
  const b = entryOf(report, 'kaal/release/b').transports;
  assert.deepEqual(b.map((t) => t.ref), ['#2', '#3', '#4']);
  assert.deepEqual(b.map((t) => t.into), ['main', 'kaal/release/a', 'kaal/release/c']);
  assert.deepEqual(b.map((t) => t.disposition), ['WAIT', 'WORK', 'WORK'], 'a transport does not carry its disposition');
  for (const t of b) assert.ok(!('threads' in t) && !('review' in t) && !('checks' in t), 'a transport repeats the full PR content');
}
