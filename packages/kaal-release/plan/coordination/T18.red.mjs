// Case coordination/T18 tests: F14
import assert from 'node:assert/strict';
import { declaration, gather } from './fixtures.mjs';
import { ghFrom, graphql, node, ref, run as checkRun } from './recordings.mjs';
export const id = 'coordination/T18';
export const tests = ['coordination/F14'];
export const title = 'the supplier turns recorded host data into the facts the analyzer reads: type, Change, version, fit, comments, review at its version, CHECKs by newest run, landing on approval, collectors';
export async function run() {
  const plan = node(101, {
    title: 'PLAN: Add a thing',
    body: '## Change\n\nx/C5 add a thing: it does something.\n\n## From\n\nNothing.\n',
    mergeStateStatus: 'DIRTY',
    reviewThreads: { pageInfo: { hasNextPage: false }, nodes: [{ isResolved: false }, { isResolved: true }] },
    latestReviews: { nodes: [{ state: 'APPROVED', commit: { oid: 'old' } }] },
    commits: { nodes: [{ commit: { statusCheckRollup: { state: 'FAILURE', contexts: { pageInfo: { hasNextPage: false }, nodes: [
      checkRun('build', 'COMPLETED', 'FAILURE', '2026-11-12T06:00:00Z'), checkRun('build', 'COMPLETED', 'SUCCESS', '2026-11-12T07:00:00Z'), checkRun('fresh', 'IN_PROGRESS', null),
    ] } } } }] },
  });
  const plain = node(102, { title: 'Fix the thing', autoMergeRequest: { enabledAt: '2026-11-12T07:00:00Z' }, mergeStateStatus: 'BEHIND', latestReviews: { nodes: [{ state: 'CHANGES_REQUESTED', commit: { oid: 'h102' } }] } });
  const nameless = node(103, { body: '## Change\n\nSynchronization of the collector.\n' });
  const recording = { graphql: graphql({ open: [plan, plain, nameless], refs: [ref('col-a', 'a-oid'), ref('col-b', 'b-oid')] }), compare: { 'col-a': { behind_by: 2, ahead_by: 5 } } };
  const facts = await gather(ghFrom(recording), 'owner/repo', declaration());
  const byRef = (r) => facts.pieces.find((p) => p.ref === r);
  assert.deepEqual(byRef('#101'), {
    ref: '#101', type: 'PLAN', change: 'x/C5', into: 'col-a', from: 'work-101', at: 'h101', state: 'open', fit: 'conflicts', openComments: 1,
    review: { state: 'approved', at: 'old' }, landsOnApproval: false,
    checks: [{ name: 'build', conclusion: 'success' }, { name: 'fresh', conclusion: 'pending' }],
  });
  assert.equal(byRef('#102').type, 'DEFAULT', 'a title without a type is not the fallback type');
  assert.equal(byRef('#102').landsOnApproval, true);
  assert.equal(byRef('#102').fit, 'stale');
  assert.deepEqual(byRef('#102').review, { state: 'changes', at: 'h102' });
  assert.ok(!('change' in byRef('#103')), 'a Change id is guessed for a piece that names none');
  assert.ok(facts.gaps.some((g) => /#103/.test(g) && /Change/.test(g)), 'a piece that names no Change is not reported');
  assert.deepEqual(facts.collectors.find((c) => c.name === 'col-a'), { name: 'col-a', at: 'a-oid', behindTarget: 2 });
  assert.ok(!facts.collectors.some((c) => c.name === 'col-b'), 'a collector nothing depends on is listed');
}
