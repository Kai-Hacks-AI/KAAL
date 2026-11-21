// Case release/T1326 tests: release/F70
import assert from 'node:assert/strict';
import { decide } from './tree-fixtures.mjs';
import { titleOf } from './final-tree.mjs';
export const id = 'release/T1326';
export const tests = ['release/F70'];
export const title = 'the title of a PROMOTION is computed from the collector name alone';
export async function run() {
  assert.equal(titleOf('kaal/release/act-applies'), 'PROMOTION: release act-applies');
  for (const base of ['hotfix/x', 'main', 'kaal/release', 'kaal/Release/x', 'kaal/a/b/c', 'claude/kaal/x/y', '']) assert.equal(titleOf(base), null, base);
  const d = await decide({ base: 'kaal/cap/small-thing', body: 'PROMOTION: a very long line, with ids release/C1 and <b>markup</b>\n'.repeat(40) });
  assert.equal(d.title, 'PROMOTION: cap small-thing', 'the prose of the merged pull request does not reach the title');
  const other = await decide({ base: 'hotfix/small-thing' });
  assert.equal(other.action, 'skip');
  assert.equal(other.reason, 'not-an-integration-branch');
}
