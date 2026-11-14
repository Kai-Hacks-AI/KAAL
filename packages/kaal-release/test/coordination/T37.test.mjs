// Case coordination/T37 tests: F8 (the reader: paged, newest check per name, cut lists are not observed)
import assert from 'node:assert/strict';
import { node, page, readOpenPulls } from './fixtures.mjs';
export const id = 'coordination/T37';
export const tests = ['coordination/F8'];
export const title = 'the reader follows the cursor through every page of 20, reports a page limit or a missing cursor as a gap, takes the newest run per check name, maps conflict, behind, draft, changes requested and landing, and treats a cut list as not observed';
const one = async (over) => (await readOpenPulls('o/r', async () => page([node(1, over)]))).pieces[0];
const ctx = (nodes, hasNextPage = false, state = 'SUCCESS') => ({ commits: { nodes: [{ commit: { oid: 'h1', statusCheckRollup: { state, contexts: { pageInfo: { hasNextPage }, nodes } } } }] } });
const runOf = (name, conclusion, startedAt, status = 'COMPLETED') => ({ __typename: 'CheckRun', name, conclusion, status, startedAt });
export async function run() {
  const calls = [];
  const gh = async (args) => { calls.push(args); const after = args.find((a) => a.startsWith('after='))?.slice(6); return after === 'c1' ? page([node(3)]) : page([node(1), node(2)], 'c1'); };
  const read = await readOpenPulls('o/r', gh);
  assert.deepEqual(read.pieces.map((p) => p.ref), ['#1', '#2', '#3'], 'the cursor is not followed through every page');
  assert.equal(calls.length, 2);
  assert.ok(calls.every((c) => c[0] === 'graphql' && c.some((a) => /first:\s*20\b/.test(a))), 'a page does not ask for 20 pieces');
  assert.ok(calls[1].includes('after=c1') || calls[1].some((a) => a === 'after=c1'), 'the second page does not carry the cursor');
  assert.deepEqual(read.gaps, []);

  const missing = await readOpenPulls('o/r', async () => ({ data: { repository: { pullRequests: { pageInfo: { hasNextPage: true, endCursor: null }, nodes: [node(1)] } } } }));
  assert.equal(missing.pieces.length, 1);
  assert.ok(missing.gaps.some((g) => /more pieces than were read/.test(g)), 'a missing cursor is not a gap');
  let n = 0;
  const endless = await readOpenPulls('o/r', async () => page([node(++n)], 'c'));
  assert.ok(endless.pieces.length <= 20 * 1 && endless.gaps.some((g) => /more pieces than were read/.test(g)), 'the page limit is not a gap');

  const clean = await one({});
  assert.deepEqual(clean, { ref: '#1', title: 'DO: change 1', from: 'work-1', into: 'col/a', draft: false, review: 'approved', threads: 0, checks: 'success', fit: 'fits', landing: false, head: 'h1' });
  assert.equal((await one({ autoMergeRequest: { enabledAt: 'x' } })).landing, true);
  assert.equal((await one({ isDraft: true })).draft, true);
  assert.equal((await one({ mergeStateStatus: 'DIRTY' })).fit, 'conflicts');
  assert.equal((await one({ mergeStateStatus: 'BEHIND' })).fit, 'behind');
  assert.equal('fit' in (await one({ mergeStateStatus: 'UNKNOWN' })), false, 'an unknown merge state was guessed');
  for (const state of ['BLOCKED', 'UNSTABLE', 'HAS_HOOKS']) assert.equal((await one({ mergeStateStatus: state })).fit, 'fits');

  const reviews = (nodes, hasNextPage = false) => ({ latestReviews: { pageInfo: { hasNextPage }, nodes } });
  assert.equal((await one(reviews([{ state: 'CHANGES_REQUESTED', commit: { oid: 'older' } }]))).review, 'changes');
  const by = (author, state, submittedAt, oid = 'h1') => ({ state, author: { login: author }, submittedAt, commit: { oid } });
  assert.equal((await one(reviews([by('cpo', 'CHANGES_REQUESTED', '2026-11-12T10:00:00Z'), by('cpo', 'APPROVED', '2026-11-12T12:00:00Z')]))).review, 'approved', 'an old request for changes overrides the same reviewer\'s later approval');
  assert.equal((await one(reviews([by('cpo', 'APPROVED', '2026-11-12T10:00:00Z'), by('cpo', 'CHANGES_REQUESTED', '2026-11-12T12:00:00Z')]))).review, 'changes', 'a later request for changes is ignored');
  assert.equal((await one(reviews([by('cpo', 'CHANGES_REQUESTED', '2026-11-12T10:00:00Z'), by('other', 'APPROVED', '2026-11-12T12:00:00Z')]))).review, 'changes', 'another reviewer\'s approval clears a request for changes');
  assert.equal((await one(reviews([{ state: 'APPROVED', commit: { oid: 'older' } }]))).review, 'none', 'an approval of another version counts');
  assert.equal((await one(reviews([], true))).review === undefined, true, 'no approval on a cut list is taken as none');
  assert.equal((await one(reviews([{ state: 'APPROVED', commit: { oid: 'h1' } }], true))).review, 'approved');

  const threads = (nodes, hasNextPage = false) => ({ reviewThreads: { pageInfo: { hasNextPage }, nodes } });
  assert.equal((await one(threads([{ isResolved: false }, { isResolved: true }, { isResolved: false }]))).threads, 2);
  assert.equal((await one(threads([{ isResolved: true }], true))).threads, undefined, 'no open thread on a cut list is taken as zero');
  assert.equal((await one(threads([{ isResolved: false }], true))).threads, 1);

  assert.equal((await one(ctx([runOf('build', 'FAILURE', '2026-11-12T09:00:00Z'), runOf('build', 'SUCCESS', '2026-11-12T10:00:00Z')]))).checks, 'success', 'an older failure counts after a newer run of the same check');
  assert.equal((await one(ctx([runOf('build', 'SUCCESS', '2026-11-12T09:00:00Z'), runOf('build', 'FAILURE', '2026-11-12T10:00:00Z')]))).checks, 'failure');
  assert.equal((await one(ctx([runOf('build', null, '2026-11-12T10:00:00Z', 'IN_PROGRESS')]))).checks, 'pending');
  assert.equal((await one(ctx([runOf('build', 'SUCCESS', 't'), { __typename: 'StatusContext', context: 'ext', state: 'FAILURE' }]))).checks, 'failure');
  assert.equal((await one(ctx([runOf('build', 'SUCCESS', 't')], true, 'FAILURE'))).checks, 'failure', 'a cut check list does not fall back to the roll-up');
  assert.equal((await one({ commits: { nodes: [{ commit: { oid: 'h1', statusCheckRollup: null } }] } })).checks, 'none');
}
