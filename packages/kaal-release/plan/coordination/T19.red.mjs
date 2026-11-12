// Case coordination/T19 tests: F14, F17 (the vertical slice, supplier to consumer)
import assert from 'node:assert/strict';
import { analyzeFlow, declaration, gather } from './fixtures.mjs';
import { ghFrom, graphql, node, ref } from './recordings.mjs';
export const id = 'coordination/T19';
export const tests = ['coordination/F14', 'coordination/F17'];
export const title = 'recorded host data goes through the supplier and the Script, unchanged between them, and yields one actionable recommendation';
export async function run() {
  const promotion = node(200, {
    title: 'PROMOTION: Promote the collector',
    body: '## Change\n\nc/C1 promotion: the collector.\n\n## Why now\n\nNext in line.\n',
    headRefName: 'col-a', headRefOid: 'a-oid', baseRefName: 'main',
    latestReviews: { nodes: [{ state: 'APPROVED', commit: { oid: 'a-oid' } }] },
  });
  const recording = { graphql: graphql({ open: [promotion], refs: [ref('col-a', 'a-oid')] }), compare: { 'col-a': { behind_by: 0, ahead_by: 4 } } };
  const gathered = await gather(ghFrom(recording), 'owner/repo', declaration());
  const facts = JSON.parse(JSON.stringify(gathered)); // the only thing that crosses to the Script is data
  const result = await analyzeFlow(facts, declaration());
  const first = result.actions[0];
  assert.ok(first, 'no recommendation came out of the connected path');
  assert.equal(first.action, 'LAND');
  assert.equal(first.target, '#200');
  assert.equal(first.layer, 'promotion');
  assert.equal(first.pair, 'col-a');
  assert.equal(first.authority, 'lander');
  assert.equal(result.actions.filter((a) => a.status === 'ready').length, 1, 'more than one thing is ready at once');
  assert.ok(!/\b(git|gh|merge --admin|force)\b/i.test(JSON.stringify(first)), 'the recommendation reads as a command or a bypass');
  assert.deepEqual(await analyzeFlow(JSON.parse(JSON.stringify(gathered)), declaration()), result, 'the path is not deterministic');
}
