// Case engineering/T1756 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit } from './fixture.mjs';
export const id = 'engineering/T1756';
export const tests = ['engineering/F104'];
export const title = 'a merge into the default branch that a merged pull request accounts for is not reported as unaccounted';
export async function run() {
  const answers = (tip) => [
    { match: '/activity', body: [{ ref: 'refs/heads/main', before: tip, after: tip, timestamp: '2026-01-01T00:00:00Z', activity_type: 'pr_merge' }] },
    { match: '/pulls', body: [{ number: 1, state: 'closed', merged_at: '2026-01-01T00:00:00Z', merge_commit_sha: tip, base: { ref: 'main' }, head: { ref: 'claude/a', sha: tip, repo: { full_name: 'o/r' } } }] },
  ];
  const { out } = audit({ event: 'push', ref: 'main', answers });
  assert.doesNotMatch(out, /no merged pull request accounts for/, out);
}
