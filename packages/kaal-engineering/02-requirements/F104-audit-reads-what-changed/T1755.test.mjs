// Case engineering/T1755 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit } from './fixture.mjs';
export const id = 'engineering/T1755';
export const tests = ['engineering/F104'];
export const title = 'a merge into the default branch that no merged pull request accounts for still fails the audit';
export async function run() {
  const answers = (tip) => [
    { match: '/activity', body: [{ ref: 'refs/heads/main', before: tip, after: tip, timestamp: '2026-01-01T00:00:00Z', activity_type: 'pr_merge' }] },
    { match: '/pulls', body: [] },
  ];
  const { status, out } = audit({ event: 'push', ref: 'main', answers });
  assert.equal(status, 1, `the audit did not fail: ${out}`);
  assert.match(out, /no merged pull request accounts for/);
}
