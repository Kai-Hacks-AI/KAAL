// Case coordination/T3 tests: F5
import assert from 'node:assert/strict';
import { bad, byTarget, analyzeFlow, declaration, facts, ok, request } from './fixtures.mjs';
export const id = 'coordination/T3';
export const tests = ['coordination/F5'];
export const title = 'a pending correction (changes requested, unresolved threads, a conflict or a failing check) is REVISE PR for the author, ahead of REVIEW PR';
export async function run() {
  const requests = [
    request(11, { review: { state: 'CHANGES_REQUESTED', at: 'h11' } }),
    request(12, { unresolvedThreads: 2, review: null }),
    request(13, { checks: [bad('build'), ok('fresh')], review: null }),
    request(14, { mergeable: 'conflicting', review: null }),
  ];
  const result = await analyzeFlow(facts({ collectors: [], requests }), declaration({ promotions: [] }));
  const causes = { '#11': /changes requested/i, '#12': /thread/i, '#13': /build|check/i, '#14': /conflict/i };
  for (const [target, cause] of Object.entries(causes)) {
    assert.equal(result.actions.filter((a) => a.target === target).length, 1, `${target} does not yield exactly one entry`);
    const entry = byTarget(result, target);
    assert.equal(entry.action, 'REVISE PR', `${target} is not a REVISE PR`);
    assert.equal(entry.authority, 'author', `${target} is not the author's`);
    assert.match(entry.reason, cause, `${target} does not name its cause`);
  }
}
