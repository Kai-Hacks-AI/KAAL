// Case review/T1588 tests: review/F40. The Approver approves only from facts attributed to Hosting and evidence of a passing check signed by the Inspector at the same revision.
import assert from 'node:assert/strict';
import { evidence, facts, HEAD, kinds, loadApproval } from './lib.mjs';
export const id = 'review/T1588';
export const tests = ['review/F40'];
export const title = 'facts attributed to Hosting that show a pure merge, with evidence of a passing check signed by the Inspector at the same revision, are approve, and a moved head or base, a change that is not a pure merge, facts that are not attributed to Hosting, a check that is missing, not passing, of another revision or signed by another, a pull request of the Approver itself and malformed facts or evidence each abstain with their own finding, the kind of a pull request is read from the facts and not from its title, nothing that decides is taken from what the run claims, and nothing but approve or abstain is ever answered';
export async function run() {
  const { judgeApproval } = await loadApproval();
  assert.deepEqual(judgeApproval(evidence(), facts()), { decision: 'approve', findings: [] });

  const abstains = (more, kind, why, f = facts()) => {
    const a = judgeApproval(evidence(more), f);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes(kind), `${why}: expected ${kind}, got ${kinds(a)}`);
  };
  abstains({ pr: { head: 'c'.repeat(40) } }, 'head-moved', 'the head moved after the evidence');
  abstains({ pr: { base: 'd'.repeat(40) } }, 'base-moved', 'the base moved after the evidence');
  abstains({}, 'head-moved', 'a head that is not the one the facts name', facts({ head: 'e'.repeat(40) }));
  abstains({}, 'not-pure-merge', 'a change that is not a pure merge', facts({ pureMerge: false }));
  abstains({}, 'not-pure-merge', 'a pure-merge fact that is a word and not true', facts({ pureMerge: 'true' }));
  abstains({}, 'not-pure-merge', 'a pure-merge fact that is absent', facts({ pureMerge: undefined }));
  abstains({ check: { conclusion: 'fail' } }, 'check-not-pass', 'a failed check');
  abstains({ check: { conclusion: 'unknown' } }, 'check-not-pass', 'an unknown check');
  abstains({ check: { conclusion: 'skipped' } }, 'check-not-pass', 'a check with any other conclusion');
  abstains({ check: { revision: 'c'.repeat(40) } }, 'check-other-revision', 'a check of another revision');
  abstains({ check: { signer: 'someone-else' } }, 'check-other-signer', 'a check signed by another');
  abstains({ check: { name: 'verify Delivery' } }, 'check-missing', 'another check than verify Sync');
  abstains({ pr: { author: 'approver' } }, 'own-pull-request', 'a pull request of the Approver itself');

  const unattributed = (f, why) => {
    const a = judgeApproval(evidence(), f);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes('facts-unattributed'), `${why}: expected facts-unattributed, got ${kinds(a)}`);
  };
  unattributed(facts({ source: undefined }), 'facts without a source');
  unattributed(facts({ source: 'the-run' }), 'facts that the run attributes to itself');
  unattributed(facts({ source: 'Hosting' }), 'a source that only resembles Hosting');

  const raw = (e, f, kind, why) => {
    const a = judgeApproval(e, f);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes(kind), `${why}: expected ${kind}, got ${kinds(a)}`);
  };
  raw(undefined, facts(), 'malformed-evidence', 'missing evidence');
  raw(null, facts(), 'malformed-evidence', 'null evidence');
  raw('approve', facts(), 'malformed-evidence', 'evidence that is text');
  raw({}, facts(), 'malformed-evidence', 'empty evidence');
  raw({ pr: evidence().pr, execution: evidence().execution }, facts(), 'check-missing', 'evidence without a check');
  raw(evidence(), undefined, 'malformed-evidence', 'no facts');
  raw(evidence(), null, 'malformed-evidence', 'null facts');
  raw(evidence(), 'hosting', 'malformed-evidence', 'facts that are text');
  raw(evidence(), { source: 'hosting', head: HEAD }, 'malformed-evidence', 'facts without a base');

  const claimed = evidence();
  claimed.content = { pureMerge: true };
  claimed.main = facts().main;
  assert.equal(judgeApproval(claimed, facts({ pureMerge: false })).decision, 'abstain', 'a pure merge that the run claims and the facts deny abstains');
  const withTitle = { ...evidence(), pr: { ...evidence().pr, title: 'SYNC: kaal/review/x', ref: 'kaal/review/x' } };
  assert.equal(judgeApproval(withTitle, facts({ pureMerge: false })).decision, 'abstain', 'a pull request that is titled and branched like a SYNC is not a SYNC by content');
  const unlike = { ...evidence(), pr: { ...evidence().pr, title: 'a change of mine', ref: 'feature/x' } };
  assert.equal(judgeApproval(unlike, facts()).decision, 'approve', 'a pure merge with an unlike title and branch is a SYNC by content');

  for (const [e, f] of [[undefined, facts()], [null, null], [1, 1], [[], []], [{}, {}], [evidence(), facts()], [{ ...evidence(), check: null }, facts()], [{ pr: null, check: null, execution: null }, facts()]]) {
    const a = judgeApproval(e, f);
    assert.ok(['approve', 'abstain'].includes(a.decision), 'only approve or abstain is ever answered');
    assert.ok(a.decision === 'abstain' ? a.findings.length > 0 : a.findings.length === 0, 'an abstention names a reason and an approval names none');
  }
}
