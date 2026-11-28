// Case engineering/T1760 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit, merged, record, filler } from './fixture.mjs';
export const id = 'engineering/T1760';
export const tests = ['engineering/F104'];
export const title = 'a full page of merge records widens unless it holds the record of every commit of the push';
export async function run() {
  // partial coverage: two commits pushed, the full page holds the record of one only
  const partial = audit({ event: 'push', ref: 'kaal/x', commits: 2, answers: (t, s) => [
    { match: `commits/${s[1]}/pulls`, body: [merged(1, s[1])] },
    { match: `commits/${s[2]}/pulls`, body: [merged(2, s[2])] },
    { match: 'activity\\?per_page=100&ref=refs/heads/kaal/x', body: [record('kaal/x', s[2], 0), ...filler('kaal/x', 99)] },
    { match: 'pulls\\?state=all', body: [] },
    { match: '/activity', body: [] },
  ] });
  assert.ok(partial.calls.some((c) => /--paginate/.test(c) && /pulls\?state=all/.test(c)), `a full page holding one of two records was not widened: ${partial.calls.join(' | ')}`);
  // full coverage: the full page holds the record of the one commit pushed, so the narrow read stands
  const whole = audit({ event: 'push', ref: 'kaal/x', commits: 1, answers: (t, s) => [
    { match: `commits/${s[1]}/pulls`, body: [merged(1, s[1])] },
    { match: 'activity\\?per_page=100&ref=refs/heads/kaal/x', body: [record('kaal/x', s[1], 0), ...filler('kaal/x', 99)] },
    { match: '/activity', body: [] },
  ] });
  assert.ok(!whole.calls.some((c) => /--paginate/.test(c)), `a full page holding every record was widened: ${whole.calls.join(' | ')}`);
  assert.ok(whole.calls.length <= 3, `the narrow read made ${whole.calls.length} calls`);
}
