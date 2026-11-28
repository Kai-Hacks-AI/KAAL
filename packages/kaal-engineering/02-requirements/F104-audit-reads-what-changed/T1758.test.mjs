// Case engineering/T1758 tests: engineering/F104
import assert from 'node:assert/strict';
import { audit, merged } from './fixture.mjs';
export const id = 'engineering/T1758';
export const tests = ['engineering/F104'];
export const title = 'a push that lands several commits judges every one of them, and a commit without a pull request fails';
export async function run() {
  const answers = (tip, s) => [
    { match: `commits/${s[1]}/pulls`, body: [merged(1, s[1])] },
    { match: `commits/${s[2]}/pulls`, body: [] },
    { match: `commits/${s[3]}/pulls`, body: [merged(3, s[3])] },
    { match: '/activity', body: [] },
  ];
  const { status, out, shas } = audit({ event: 'push', ref: 'kaal/x', commits: 3, answers });
  assert.equal(status, 1, `the audit did not fail: ${out}`);
  for (const c of shas.slice(1)) assert.match(out, new RegExp(`Landing: .*at ${c.slice(0, 7)}`), `the commit ${c.slice(0, 7)} was not judged:\n${out}`);
  assert.match(out, new RegExp(`at ${shas[2].slice(0, 7)}: GitHub associates no pull request`), 'the commit without a pull request was not named');
}
