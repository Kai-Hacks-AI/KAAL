// Case coordination/T20 tests: F13, F15, F16
import assert from 'node:assert/strict';
import { analyzeFlow, declaration, gather, collector } from './fixtures.mjs';
import { ghFrom, graphql, node, ref } from './recordings.mjs';
export const id = 'coordination/T20';
export const tests = ['coordination/F13', 'coordination/F15', 'coordination/F16'];
export const title = 'delivery provenance comes from the landed PROMOTION the host recorded; where the host cannot supply it, it is reported, nothing is guessed and later pairs wait';
const landed = (over = {}) => node(190, {
  title: 'PROMOTION: Promote the first collector',
  body: '## Change\n\nc/C1 promotion: the first collector.\n',
  headRefName: 'col-a', headRefOid: 'a-oid', baseRefName: 'main', state: 'MERGED', mergedAt: '2026-11-12T08:00:00Z', mergeCommit: { oid: 'm-1' },
  ...over,
});
const pairs = declaration({ promotions: [{ collector: 'col-a', change: 'c/C1' }, { collector: 'col-b', change: 'c/C2' }] });
const refs = [ref('col-a', 'a-oid'), ref('col-b', 'b-oid')];
const compare = { 'col-a': { behind_by: 0, ahead_by: 0 }, 'col-b': { behind_by: 1, ahead_by: 3 } };
const through = async (piece) => {
  const facts = await gather(ghFrom({ graphql: graphql({ landed: [piece], refs }), compare }), 'owner/repo', pairs);
  return { facts, result: await analyzeFlow(JSON.parse(JSON.stringify(facts)), pairs) };
};
export async function run() {
  const supplied = await through(landed());
  assert.deepEqual(supplied.facts.deliveries, [{ collector: 'col-a', delivered: 'a-oid', ref: '#190', landedOn: 'm-1' }]);
  assert.ok(supplied.result.actions.some((a) => a.pair === 'col-b'), 'the next pair does not become active once the first is delivered');
  assert.ok(!supplied.result.actions.some((a) => a.pair === 'col-a'), 'a delivered pair is offered again');

  for (const missing of [{ headRefOid: null }, { mergeCommit: null }]) {
    const none = await through(landed(missing));
    assert.deepEqual(none.facts.deliveries, [], 'a delivery is invented when the host did not record it');
    assert.ok(none.facts.gaps.some((g) => /#190/.test(g) && /deliver|provenance/i.test(g)), 'the missing provenance fact is not reported by the supplier');
    assert.ok(none.result.notJudged.some((n) => /#190/.test(n)), 'the Script does not carry the gap');
    assert.ok(!none.result.actions.some((a) => a.pair === 'col-a'), 'a finding is guessed for the unjudged pair');
    assert.ok(none.result.actions.every((a) => a.pair !== 'col-b' || a.status === 'blocked'), 'a later pair proceeds past an unjudged delivery');
  }
}
