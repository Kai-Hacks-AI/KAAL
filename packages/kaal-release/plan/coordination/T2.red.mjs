// Case coordination/T2 tests: F5
import assert from 'node:assert/strict';
import { byTarget, analyzeFlow, declaration, facts, request } from './fixtures.mjs';
export const id = 'coordination/T2';
export const tests = ['coordination/F5'];
export const title = 'a request whose head moved after its approval is REVIEW PR, naming both commits; approved at the current head with auto-merge off is ENABLE AUTO-MERGE';
export async function run() {
  const moved = request(10, { headSha: 'new', review: { state: 'APPROVED', at: 'old' }, autoMerge: false });
  const result = await analyzeFlow(facts({ collectors: [], requests: [moved] }), declaration({ promotions: [] }));
  const entries = result.actions.filter((a) => a.target === '#10');
  assert.equal(entries.length, 1, 'the request does not yield exactly one entry');
  assert.equal(entries[0].action, 'REVIEW PR', 'an approval at an older head is accepted');
  assert.equal(entries[0].authority, 'reviewer', 'the review is not the reviewer\'s');
  const evidence = JSON.stringify(entries[0].evidence);
  assert.match(evidence, /old/, 'the commit that was approved is not shown');
  assert.match(evidence, /new/, 'the current head is not shown');

  const current = request(11, { autoMerge: false });
  const again = await analyzeFlow(facts({ collectors: [], requests: [current] }), declaration({ promotions: [] }));
  assert.equal(byTarget(again, '#11')?.action, 'ENABLE AUTO-MERGE', 'an approval at the current head with auto-merge off does not yield ENABLE AUTO-MERGE');
  assert.equal(byTarget(again, '#11')?.authority, 'author');
}
