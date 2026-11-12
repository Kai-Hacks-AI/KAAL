// Case coordination/T21 tests: F14, F15
import assert from 'node:assert/strict';
import { analyzeFlow, declaration, gather } from './fixtures.mjs';
import { ghFrom, graphql, node, ref } from './recordings.mjs';
export const id = 'coordination/T21';
export const tests = ['coordination/F14', 'coordination/F15'];
export const title = 'what the host cannot supply, truncated lists, a collector it cannot compare and an unreachable host, are reported explicitly and never defaulted';
export async function run() {
  const compare = { 'col-a': { behind_by: 0, ahead_by: 0 } };
  const truncated = await gather(ghFrom({ graphql: graphql({ open: [node(1)], refs: [ref('col-a', 'a-oid')], openMore: true, landedMore: true, refsMore: true }), compare }), 'owner/repo', declaration());
  for (const list of [/open/i, /landed/i, /ref|collector/i]) assert.ok(truncated.gaps.some((g) => list.test(g) && /truncat|more|incomplete/i.test(g)), `a truncated list is not reported: ${list}`);

  const unknown = await gather(ghFrom({ graphql: graphql({ refs: [ref('col-a', 'a-oid')] }), compare: {} }), 'owner/repo', declaration());
  const col = unknown.collectors.find((c) => c.name === 'col-a');
  assert.ok(col && !('behindTarget' in col), 'a distance the host did not supply is defaulted');
  assert.ok(unknown.gaps.some((g) => /col-a/.test(g) && /behind|compare/i.test(g)), 'an unknown distance is not reported');
  const judged = await analyzeFlow(JSON.parse(JSON.stringify(unknown)), declaration());
  assert.ok(judged.notJudged.some((n) => /col-a/.test(n)), 'the Script does not carry the supplier gap');

  const missingRef = await gather(ghFrom({ graphql: graphql({}), compare }), 'owner/repo', declaration());
  assert.ok(missingRef.gaps.some((g) => /col-a/.test(g)), 'a declared collector the host does not have is not reported');

  await assert.rejects(gather(ghFrom({ graphql: new Error('HTTP 502 from the host') }), 'owner/repo', declaration()), /502/, 'an unreachable host yields partial facts instead of an error naming the host failure');
}
