// Case engineering/T1759 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit, merged } from './fixture.mjs';
export const id = 'engineering/T1759';
export const tests = ['engineering/F104'];
export const title = 'a list that may be incomplete is not trusted: the audit reads everything and judges, it never passes on a thin read';
export async function run() {
  const full = (s) => ({ match: `commits/${s[1]}/pulls`, body: Array.from({ length: 100 }, (_, i) => merged(i + 1, s[1])) });
  const widened = (r, what) => {
    assert.ok(r.calls.some((c) => /--paginate/.test(c) && /pulls\?state=all/.test(c)), `${what} was not widened to every pull request: ${r.calls.join(' | ')}`);
    assert.ok([1, 2].includes(r.status), `${what} passed: exit ${r.status}: ${r.out}`);
  };
  // a commit whose pull request list is a full page
  widened(audit({ event: 'push', ref: 'kaal/x', commits: 1, answers: (t, s) => [full(s), { match: '/activity', body: [] }, { match: 'pulls\\?state=all', body: [] }] }), 'a full page of pull requests');
  // more than twenty commits in one push
  widened(audit({ event: 'push', ref: 'kaal/x', commits: 21, answers: () => [{ match: '/activity', body: [] }, { match: 'pulls\\?state=all', body: [] }] }), 'a push of 21 commits');
  // a `before` that is not in the history of `after`, as after a forced push
  widened(audit({ event: 'push', ref: 'kaal/x', commits: 1, before: 'f'.repeat(40), answers: () => [{ match: '/activity', body: [] }, { match: 'pulls\\?state=all', body: [] }] }), 'a before outside the history');
}
