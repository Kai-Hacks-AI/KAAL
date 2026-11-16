// Case release/T550 tests: C39 (acceptance example 1: a branch without a PR stays visible)
import assert from 'node:assert/strict';
import { branches, config, entryOf, load, scriptPath } from './fixtures.mjs';
export const id = 'release/T550';
export const tests = ['release/C39'];
export const title = 'a branch with no PR appears in Show WIP in its place, with no transport, and shows no outstanding work it was not told of';
export async function run() {
  const { showWip } = await load(scriptPath);
  const report = showWip({ pieces: [], branches: branches('main', 'kaal/release/a', 'hotfix/x', 'wire/y', 'claude/z'), gaps: [] }, config());
  assert.ok(report.inventory, 'the report holds no inventory');
  for (const [branch, place] of [['kaal/release/a', 'kaal'], ['hotfix/x', 'hotfix'], ['wire/y', 'wire'], ['claude/z', 'development']]) {
    const entry = entryOf(report, branch);
    assert.ok(entry, `${branch} is not in the inventory`);
    assert.equal(entry.place, place, `${branch} is in ${entry.place}, not ${place}`);
    assert.deepEqual(entry.transports, [], `${branch} shows a transport it was not given`);
  }
  assert.equal(entryOf(report, 'main'), undefined, 'main is an entry; it is a destination, and stock only by the package rule');
  assert.ok(!('outstanding' in entryOf(report, 'kaal/release/a')), 'branch existence is shown as outstanding work');
}
