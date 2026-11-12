// Case coordination/T3 tests: F5
import assert from 'node:assert/strict';
import { coordinate, declaration, facts, request } from './fixtures.mjs';
export const id = 'coordination/T3';
export const tests = ['coordination/F5'];
export const title = 'a pending correction (changes requested, unresolved threads or red CI) yields REVISE PR for the author, taking precedence over REVIEW PR';
export async function run() {
  const requests = [
    request(11, { review: { state: 'CHANGES_REQUESTED', at: 'h11' } }),
    request(12, { unresolvedThreads: 2, review: null }),
    request(13, { ci: 'failure', review: null }),
  ];
  const result = await coordinate(facts({ collectors: [], requests }), declaration({ candidates: [] }));
  const causes = { '#11': /changes requested/i, '#12': /thread/i, '#13': /ci/i };
  for (const [target, cause] of Object.entries(causes)) {
    const entries = result.actions.filter((a) => a.target === target);
    assert.equal(entries.length, 1, `${target} does not yield exactly one entry`);
    assert.equal(entries[0].action, 'REVISE PR', `${target} is not a REVISE PR`);
    assert.equal(entries[0].authority, 'author', `${target} is not the author's`);
    assert.match(entries[0].reason, cause, `${target} does not name its cause`);
  }
}
